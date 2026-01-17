const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Analyze an image for pothole detection using Roboflow
 * @param {File|Blob} imageFile - The image file to analyze
 * @returns {Promise<Object>} Detection results
 */
export async function analyzeImage(imageFile) {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`${API_URL}/api/detect`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to analyze image');
        }

        const result = await response.json();
        return result.data;

    } catch (error) {
        console.error('AI Service Error:', error);
        throw error;
    }
}

/**
 * Check if AI detection service is configured and ready
 * @returns {Promise<Object>} Service health status
 */
export async function checkAIServiceHealth() {
    try {
        const response = await fetch(`${API_URL}/api/detect/health`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('AI Service Health Check Error:', error);
        return {
            success: false,
            configured: false,
            message: 'Unable to connect to AI service'
        };
    }
}

const aiService = {
    analyzeImage,
    checkAIServiceHealth
};

export default aiService;
