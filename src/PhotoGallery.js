// src/PhotoGallery.js - Hover Details & Delete Version
import React, { useState, useEffect } from 'react';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { list, getUrl, remove } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  Card, Flex, Heading, Text, Button, Loader, Badge, View, Image, Input, SelectField, Grid, Alert
} from '@aws-amplify/ui-react';
import './PhotoGallery.css';

function PhotoGallery({ searchQuery = '' }) {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filenameQuery, setFilenameQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deletingKey, setDeletingKey] = useState(null);

  // Fetch all photos from S3
  const fetchFromS3 = async () => {
    setIsLoading(true);
    try {
      const session = await fetchAuthSession();
      const userId = session?.userSub;
      if (!userId) {
        console.error("No user ID found");
        setPhotos([]);
        setFilteredPhotos([]);
        return;
      }

      console.log('Fetching photos for user:', userId);

      const result = await list({
        prefix: `user_data/${userId}/`,
        options: { level: 'private' }
      });

      console.log('Found items in S3:', result.items.length);

      const photosWithData = await Promise.all(
        result.items.map(async (item) => {
          try {
            const url = await getUrl({ 
              key: item.key, 
              options: { 
                level: 'private',
                expiresIn: 3600
              } 
            });

            return {
              S3Key: item.key,
              imageUrl: url.url.toString(),
              uploadedAt: item.lastModified?.getTime() || Date.now(),
              title: item.key.split('/').pop(),
              labels: [],
              caption: ''
            };
          } catch (err) {
            console.error('Error getting URL for:', item.key, err);
            return null;
          }
        })
      );

      const validPhotos = photosWithData.filter(p => p !== null);
      console.log('Valid photos with URLs:', validPhotos.length);

      setPhotos(validPhotos);
      setFilteredPhotos(validPhotos);
    } catch (error) {
      console.error('Error fetching photos from S3:', error);
      setPhotos([]);
      setFilteredPhotos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch metadata from DynamoDB for AI search
  const fetchMetadataFromDynamoDB = async () => {
    try {
      const session = await fetchAuthSession();
      const userId = session?.userSub;
      if (!userId) return {};

      const credentials = session.credentials;
      const client = new DynamoDBClient({
        region: "ap-south-1",
        credentials: credentials
      });

      const scanCmd = new ScanCommand({ TableName: "PhotoMetaData" });
      const data = await client.send(scanCmd);
      const allItems = Array.isArray(data.Items) ? data.Items : [];

      const metadataMap = {};
      allItems
        .filter(item => (item.userId?.S || item.userId) === userId)
        .forEach(item => {
          const key = item.imageKey?.S || item.imageKey || '';
          metadataMap[key] = {
            labels: Array.isArray(item.labels)
              ? item.labels.map(l => typeof l === "string" ? l : (l?.S || ""))
              : (item.labels?.L || []).map(l => l?.S || ""),
            caption: item.caption?.S || item.caption || ''
          };
        });

      console.log('Fetched metadata for', Object.keys(metadataMap).length, 'items');
      return metadataMap;
    } catch (error) {
      console.error('Error fetching metadata from DynamoDB:', error);
      return {};
    }
  };

  // Delete photo from S3 and DynamoDB
  const handleDelete = async (photo) => {
    if (!window.confirm(`Are you sure you want to delete "${photo.title}"?`)) {
      return;
    }

    setDeletingKey(photo.S3Key);
    console.log('🗑️ Starting delete for:', photo.S3Key);
    
    try {
      const session = await fetchAuthSession();
      const userId = session?.userSub;
      
      console.log('👤 User ID:', userId);
      console.log('🔑 Full S3 Key:', photo.S3Key);

      // Delete from S3 - Try the exact key first
      try {
        console.log('🔄 Attempting S3 deletion...');
        
        await remove({ 
          key: photo.S3Key,
          options: { 
            level: 'private'
          }
        });
        
        console.log('✅ Successfully deleted from S3');
      } catch (s3Error) {
        console.error('❌ S3 deletion failed:', s3Error);
        throw new Error(`S3 deletion failed: ${s3Error.message}`);
      }

      // Delete from DynamoDB (optional - won't fail if it doesn't exist)
      try {
        const credentials = session.credentials;
        const dynamoClient = new DynamoDBClient({
          region: "ap-south-1",
          credentials: credentials
        });
        const docClient = DynamoDBDocumentClient.from(dynamoClient);

        const filename = photo.S3Key.split('/').pop();
        
        // All possible key formats in DynamoDB
        const possibleKeys = [
          photo.S3Key,
          `public/user_data/${userId}/${filename}`,
          `user_data/${userId}/${filename}`,
          `public/${photo.S3Key}`,
          filename
        ];

        console.log('🔍 Trying to delete from DynamoDB with keys:', possibleKeys);

        for (const key of possibleKeys) {
          try {
            await docClient.send(new DeleteCommand({
              TableName: "PhotoMetaData",
              Key: {
                imageKey: key
              }
            }));
            console.log('✅ Deleted from DynamoDB with key:', key);
            break;
          } catch (e) {
            // Silent fail, try next key
          }
        }
      } catch (dbError) {
        console.warn('⚠️ DynamoDB deletion failed (non-critical):', dbError.message);
        // Don't fail - DynamoDB deletion is optional
      }

      // Update UI - remove from display
      console.log('🔄 Updating UI...');
      const updatedPhotos = photos.filter(p => p.S3Key !== photo.S3Key);
      const updatedFiltered = filteredPhotos.filter(p => p.S3Key !== photo.S3Key);
      setPhotos(updatedPhotos);
      setFilteredPhotos(updatedFiltered);

      setDeleteMessage(`✓ "${photo.title}" deleted successfully`);
      setTimeout(() => setDeleteMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Delete operation failed:', error);
      setDeleteMessage(`✗ ${error.message}`);
      setTimeout(() => setDeleteMessage(''), 5000);
    } finally {
      setDeletingKey(null);
    }
  };

  // Apply AI search filter
  const applyAISearchFilter = async (allPhotos, query) => {
    if (!query.trim()) {
      return allPhotos;
    }

    console.log('Applying AI search for:', query);
    const metadataMap = await fetchMetadataFromDynamoDB();

    const queryLower = query.toLowerCase().trim();
    const filtered = allPhotos.filter(photo => {
      const filename = photo.S3Key.split('/').pop();
      
      let metadata = null;
      for (const key of Object.keys(metadataMap)) {
        if (key.endsWith(filename) || key === photo.S3Key) {
          metadata = metadataMap[key];
          break;
        }
      }

      if (!metadata) {
        return false;
      }

      photo.labels = metadata.labels || [];
      photo.caption = metadata.caption || '';

      const matchesCaption = metadata.caption.toLowerCase().includes(queryLower);
      const matchesLabel = metadata.labels.some(l => 
        l.toLowerCase().includes(queryLower)
      );

      return matchesCaption || matchesLabel;
    });

    console.log('AI search found', filtered.length, 'matching photos');
    return filtered;
  };

  useEffect(() => {
    fetchFromS3();
  }, []);

  useEffect(() => {
    const filterPhotos = async () => {
      setIsLoading(true);
      const filtered = await applyAISearchFilter(photos, searchQuery);
      setFilteredPhotos(filtered);
      setIsLoading(false);
    };

    if (photos.length > 0) {
      filterPhotos();
    }
  }, [searchQuery]);

  const handleFilenameSearch = (query) => {
    setFilenameQuery(query);
    const lower = query.toLowerCase();
    const filtered = (searchQuery ? filteredPhotos : photos).filter(p =>
      p.title?.toLowerCase().includes(lower)
    );
    setFilteredPhotos(filtered);
  };

  const handleSort = (value) => {
    setSortBy(value);
    const sorted = [...filteredPhotos].sort((a, b) => {
      return value === 'newest'
        ? (b.uploadedAt || 0) - (a.uploadedAt || 0)
        : (a.uploadedAt || 0) - (b.uploadedAt || 0);
    });
    setFilteredPhotos(sorted);
  };

  const handleRefresh = () => {
    setFilenameQuery('');
    fetchFromS3();
  };

  return (
    <View className="photo-gallery-glass">
      <Flex direction="row" justifyContent="space-between" marginBottom="1.5rem">
        <Input
          placeholder="Search by filename..."
          value={filenameQuery}
          onChange={(e) => handleFilenameSearch(e.target.value)}
          width="60%"
        />
        <SelectField
          labelHidden
          value={sortBy}
          onChange={(e) => handleSort(e.target.value)}
          width="30%"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </SelectField>
      </Flex>

      {deleteMessage && (
        <Alert variation={deleteMessage.includes('✓') ? 'success' : 'error'} marginBottom="1rem">
          {deleteMessage}
        </Alert>
      )}

      {searchQuery && (
        <Flex 
          backgroundColor="blue.100" 
          padding="0.75rem" 
          borderRadius="medium"
          marginBottom="1rem"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text>
            🔍 AI Search: <strong>"{searchQuery}"</strong>
          </Text>
          <Badge variation="info">{filteredPhotos.length} results</Badge>
        </Flex>
      )}

      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" height="50vh">
          <Loader size="large" />
          <Text marginLeft="1rem">
            {searchQuery ? 'Searching photos...' : 'Loading your photos...'}
          </Text>
        </Flex>
      ) : filteredPhotos.length === 0 ? (
        <Flex justifyContent="center" alignItems="center" height="50vh" direction="column">
          <Text fontSize="large" marginBottom="0.5rem">
            {searchQuery.trim() 
              ? "No matching photos found." 
              : filenameQuery.trim()
                ? "No photos match that filename."
                : "No photos yet. Upload one!"}
          </Text>
          {searchQuery.trim() && (
            <Text fontSize="small" color="gray">
              Try a different search term like "cat", "light", or "screenshot"
            </Text>
          )}
        </Flex>
      ) : (
        <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap="1.5rem">
          {filteredPhotos.map((photo) => (
            <div key={photo.S3Key} className="photo-card-container">
              <Card variation="elevated" padding="0" className="photo-card">
                {photo.imageUrl ? (
                  <div className="photo-wrapper">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.title}
                      objectFit="cover"
                      width="100%"
                      height="320px"
                      className="photo-image"
                      onError={(e) => {
                        console.error('Image failed to load:', photo.S3Key);
                        e.target.style.display = 'none';
                      }}
                    />
                    
                    {/* Hover Overlay with Details */}
                    <div className="photo-overlay">
                      <div className="overlay-content">
                        <Heading level={5} color="white" marginBottom="0.5rem">
                          {photo.title}
                        </Heading>
                        
                        <Text fontSize="xs" color="white" opacity="0.9">
                          📅 {photo.uploadedAt && new Date(photo.uploadedAt).toLocaleDateString()}
                        </Text>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(photo)}
                        disabled={deletingKey === photo.S3Key}
                        title="Delete photo"
                      >
                        {deletingKey === photo.S3Key ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Flex 
                    justifyContent="center" 
                    alignItems="center" 
                    height="320px"
                    backgroundColor="gray.200"
                  >
                    <Text>Image not available</Text>
                  </Flex>
                )}
              </Card>
            </div>
          ))}
        </Grid>
      )}
      
      <Flex justifyContent="center" marginTop="2rem">
        <Button className="refresh-btn-custom" onClick={handleRefresh}>
          🔄 Refresh Gallery
        </Button>
      </Flex>
    </View>
  );
}

export default PhotoGallery;