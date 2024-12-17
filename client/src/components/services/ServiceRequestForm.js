import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useService } from '../../contexts/ServiceContext';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper
} from '@mui/material';
import styled from 'styled-components';

const FormContainer = styled(Paper)`
    padding: 24px;
    margin: 24px auto;
    max-width: 600px;
`;

const steps = ['Basic Details', 'Location', 'Additional Info'];

const ServiceRequestForm = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { categories, createServiceRequest } = useService();
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: {
            postcode: '',
            city: ''
        },
        timing: {
            flexibility: 'flexible'
        },
        budget: {
            range: 'not_sure'
        }
    });

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createServiceRequest({
                ...formData,
                category: categoryId
            });
            navigate(`/service-request/success/${response._id}`);
        } catch (error) {
            console.error('Error creating service request:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            margin="normal"
                            multiline
                            rows={4}
                            required
                        />
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <TextField
                            fullWidth
                            label="Postcode"
                            name="location.postcode"
                            value={formData.location.postcode}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="City"
                            name="location.city"
                            value={formData.location.city}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Timing Flexibility</InputLabel>
                            <Select
                                name="timing.flexibility"
                                value={formData.timing.flexibility}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="flexible">I'm Flexible</MenuItem>
                                <MenuItem value="specific_date">Specific Date</MenuItem>
                                <MenuItem value="urgent">Urgent</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Budget Range</InputLabel>
                            <Select
                                name="budget.range"
                                value={formData.budget.range}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="not_sure">Not Sure</MenuItem>
                                <MenuItem value="less_than_500">Less than £500</MenuItem>
                                <MenuItem value="500_to_1000">£500 - £1,000</MenuItem>
                                <MenuItem value="1000_to_5000">£1,000 - £5,000</MenuItem>
                                <MenuItem value="more_than_5000">More than £5,000</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <FormContainer>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <form onSubmit={handleSubmit}>
                {renderStepContent(activeStep)}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                    >
                        Back
                    </Button>
                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                        >
                            Submit Request
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </form>
        </FormContainer>
    );
};

export default ServiceRequestForm; 