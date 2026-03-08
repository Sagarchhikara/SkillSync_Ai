# Real Dataset Directory

Place your real resume and job datasets here for evaluation.

## Expected Format

### Resumes Dataset (resumes.json)
```json
{
  "resumes": [
    {
      "id": "R1",
      "skills": ["react", "node.js", "mongodb"],
      "targetJobId": "J1",
      "experience": "3 years",
      "education": "BS Computer Science"
    }
  ]
}
```

### Jobs Dataset (jobs.json)
```json
{
  "jobs": [
    {
      "id": "J1",
      "title": "Full Stack Developer",
      "skills": ["react", "node.js", "express", "mongodb"],
      "experience": "2-4 years"
    }
  ]
}
```

## Data Sources

1. **Kaggle Datasets**
   - Resume Dataset: https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset
   - Job Postings: https://www.kaggle.com/datasets/arshkon/linkedin-job-postings

2. **GitHub Samples**
   - Search for "resume dataset" or "job description dataset"

3. **Custom Collection**
   - Collect anonymized resumes (remove PII)
   - Scrape job postings (respect robots.txt)

## Usage

Once datasets are placed here, the evaluation system will automatically:
- Load real data
- Calculate Top-1, Top-3, Top-5 accuracy
- Measure ranking performance
- Compare against synthetic benchmarks
