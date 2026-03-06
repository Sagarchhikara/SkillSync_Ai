const { uploadResume } = require('../resumeController');
const Resume = require('../../models/Resume');
const { parseResumeFile } = require('../../services/fileParserService');
const { extractSkills } = require('../../services/skillExtractionService');

// Mock dependencies
jest.mock('../../models/Resume');
jest.mock('../../services/fileParserService');
jest.mock('../../services/skillExtractionService');

describe('resumeController - Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            file: {
                path: 'uploads/test_resume.pdf',
                originalname: 'test_resume.pdf'
            }
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Reset mocks
        jest.clearAllMocks();
    });

    it('should successfully upload and process a resume', async () => {
        const rawText = 'I am a software engineer with Python and React skills.';
        const skills = ['python', 'react'];
        const mockResume = {
            _id: 'mock-id-123',
            filename: 'test_resume.pdf',
            filepath: 'uploads/test_resume.pdf',
            rawText,
            skills
        };

        parseResumeFile.mockResolvedValue(rawText);
        extractSkills.mockReturnValue(skills);
        Resume.create.mockResolvedValue(mockResume);

        await uploadResume(mockReq, mockRes);

        expect(parseResumeFile).toHaveBeenCalledWith('uploads/test_resume.pdf');
        expect(extractSkills).toHaveBeenCalledWith(rawText);
        expect(Resume.create).toHaveBeenCalledWith({
            filename: 'test_resume.pdf',
            filepath: 'uploads/test_resume.pdf',
            rawText,
            skills
        });

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            data: mockResume
        });
    });

    it('should return 400 if no file is uploaded', async () => {
        mockReq.file = undefined;

        await uploadResume(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'No file uploaded'
        });
        expect(parseResumeFile).not.toHaveBeenCalled();
    });

    it('should return 400 if file parsing fails', async () => {
        const errorMessage = 'Unsupported file type';
        parseResumeFile.mockRejectedValue(new Error(errorMessage));

        await uploadResume(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: errorMessage
        });
    });

    it('should return 400 if parsed text is empty', async () => {
        parseResumeFile.mockResolvedValue('   ');

        await uploadResume(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'No readable text found in resume'
        });
    });

    it('should return 400 if no skills are extracted', async () => {
        const rawText = 'I am a regular person without tech skills.';
        parseResumeFile.mockResolvedValue(rawText);
        extractSkills.mockReturnValue([]);

        await uploadResume(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'No skills extracted from resume'
        });
    });

    it('should return 500 if database save fails', async () => {
        const rawText = 'Python and React';
        const skills = ['python', 'react'];

        parseResumeFile.mockResolvedValue(rawText);
        extractSkills.mockReturnValue(skills);
        Resume.create.mockRejectedValue(new Error('DB connection failed'));

        await uploadResume(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Server error during upload'
        });
    });
});
