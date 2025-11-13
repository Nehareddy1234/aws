// src/UploadForm.js - FIXED
import React, { useState } from 'react';
import { uploadData } from '@aws-amplify/storage';
import { getCurrentUser } from '@aws-amplify/auth';
import { Button, Alert, Flex, Text, Card, Heading } from '@aws-amplify/ui-react';

function UploadForm({ userId }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = () => {
        document.getElementById('file-input').click();
    };

    const handleUpload = async () => {
        if (!file) {
            handleFileSelect();
            return;
        }

        try {
            const { userId: finalUserId } = await getCurrentUser();
            const s3Key = `user_data/${finalUserId}/${file.name}`;

            console.log(`Uploading to path: ${s3Key}`);

            setIsUploading(true);
            setStatus({ type: 'info', message: `Uploading ${file.name}...` });

            await uploadData({
                key: s3Key,
                data: file,
                options: {
                    contentType: file.type,
                    onProgress: ({ transferredBytes, totalBytes }) => {
                        const percent = Math.round((transferredBytes / totalBytes) * 100);
                        setStatus({ type: 'info', message: `Uploading... ${percent}%` });
                    }
                }
            }).result;

            console.log('Upload Successful.');
            setStatus({ type: 'success', message: '✅ Photo uploaded! AI processing started.' });
            setFile(null);

            setTimeout(() => setStatus(''), 5000);

        } catch (error) {
            console.error('Upload Failed:', error);
            setStatus({ type: 'error', message: `Upload failed: ${error.message}` });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="upload-card">
            <div className="upload-header">
                <div className="upload-icon">📤</div>
                <Heading level={4} margin="0">Upload Photos</Heading>
            </div>
            
            <Flex direction="column" gap="1rem">
                <div
                    className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleFileSelect}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ display: 'none' }}
                        id="file-input"
                    />
                    <Text className="upload-label">
                        {file ? `Selected: ${file.name}` : 'Drag & drop or click to select'}
                    </Text>
                    <Text className="upload-hint">
                        Supports JPG, PNG, WebP
                    </Text>
                </div>
                
                <Button 
                    onClick={handleUpload} 
                    isLoading={isUploading} 
                    disabled={!file || isUploading}
                    className="upload-btn"
                >
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                
                {status && (
                    <Alert variation={status.type === 'error' ? 'error' : status.type === 'success' ? 'success' : 'info'}>
                        {status.message}
                    </Alert>
                )}
            </Flex>
        </Card>
    );
}

export default UploadForm;