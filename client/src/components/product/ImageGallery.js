import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Paper,
    ImageList,
    ImageListItem
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import OptimizedImage from '../common/OptimizedImage';

const ImageGallery = ({ images }) => {
    const [currentImage, setCurrentImage] = useState(0);

    const handlePrevious = () => {
        setCurrentImage(prev => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = () => {
        setCurrentImage(prev => (prev < images.length - 1 ? prev + 1 : 0));
    };

    if (!images?.length) {
        return (
            <Paper
                sx={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100'
                }}
            >
                No images available
            </Paper>
        );
    }

    return (
        <Box sx={{ position: 'relative' }}>
            <Paper
                sx={{
                    height: 400,
                    position: 'relative',
                    overflow: 'hidden',
                    '& img': {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }
                }}
            >
                <OptimizedImage
                    src={images[currentImage].url}
                    alt={`Product image ${currentImage + 1}`}
                    width={400}
                    height={400}
                    className="gallery-image"
                />
            </Paper>

            {images.length > 1 && (
                <>
                    <IconButton
                        onClick={handlePrevious}
                        sx={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' }
                        }}
                    >
                        <NavigateBeforeIcon />
                    </IconButton>

                    <IconButton
                        onClick={handleNext}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' }
                        }}
                    >
                        <NavigateNextIcon />
                    </IconButton>
                </>
            )}

            {images.length > 1 && (
                <ImageList
                    sx={{
                        mt: 1,
                        maxHeight: 100,
                        gridAutoFlow: 'column',
                        gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr) !important`,
                        gridTemplateRows: 'auto !important',
                    }}
                    cols={Math.min(images.length, 5)}
                    rowHeight={100}
                >
                    {images.map((image, index) => (
                        <ImageListItem
                            key={image.url}
                            onClick={() => setCurrentImage(index)}
                            sx={{
                                cursor: 'pointer',
                                opacity: currentImage === index ? 1 : 0.6,
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 1 }
                            }}
                        >
                            <OptimizedImage
                                src={image.url}
                                alt={`Thumbnail ${index + 1}`}
                                width={100}
                                height={100}
                                className="gallery-image"
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            )}
        </Box>
    );
};

export default ImageGallery; 