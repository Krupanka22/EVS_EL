import React, { useRef, useEffect } from 'react';

const BoundingBoxOverlay = ({ imageUrl, predictions, containerWidth, containerHeight }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !predictions || predictions.length === 0) return;

        const ctx = canvas.getContext('2d');
        const image = new Image();
        image.src = imageUrl;

        image.onload = () => {
            // Set canvas dimensions to match the displayed image size
            canvas.width = containerWidth || image.width;
            canvas.height = containerHeight || image.height;

            // Calculate scale factors if the image is resized in the container
            const scaleX = canvas.width / image.width;
            const scaleY = canvas.height / image.height;

            // Clear previous drawings
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw bounding boxes
            predictions.forEach((prediction) => {
                const { x, y, width, height, confidence } = prediction;

                // Roboflow returns center (x, y), so we need to adjust for top-left
                const xPos = (x - width / 2) * scaleX;
                const yPos = (y - height / 2) * scaleY;
                const boxWidth = width * scaleX;
                const boxHeight = height * scaleY;

                // Draw box
                ctx.strokeStyle = '#FF0000'; // Red color for bounding box
                ctx.lineWidth = 2;
                ctx.strokeRect(xPos, yPos, boxWidth, boxHeight);

                // Draw label background
                ctx.fillStyle = '#FF0000';
                const text = `${Math.round(confidence * 100)}%`;
                const textWidth = ctx.measureText(text).width;
                ctx.fillRect(xPos, yPos - 16, textWidth + 8, 16);

                // Draw label text
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '10px Arial';
                ctx.fillText(text, xPos + 4, yPos - 4);
            });
        };
    }, [imageUrl, predictions, containerWidth, containerHeight]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none', // Allow clicks to pass through
                width: '100%',
                height: '100%'
            }}
        />
    );
};

export default BoundingBoxOverlay;
