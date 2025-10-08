# Tech Professionals Query Example

Find technology professionals by role, skill, and location.

## Query Configuration

### Group 1 (OR) - Job Titles
- Software Engineer
- Senior Software Engineer
- Staff Engineer
- Principal Engineer
- Engineering Manager
- Tech Lead
- Full Stack Developer
- Backend Engineer
- Frontend Engineer
- DevOps Engineer

### Group 2 (OR) - Technologies/Skills
- Python
- JavaScript
- React
- Node.js
- AWS
- Kubernetes
- Machine Learning
- TypeScript
- Go

### Group 3 (OR) - Locations
- San Francisco
- New York
- Seattle
- Austin
- Boston

### Group 4 (AND) - Companies (Optional)
- Google
- Meta
- Amazon
- Microsoft
- Apple

## Generated Queries

**Without Group 4**: 10 × 9 × 5 = **450 queries**  
**With Group 4**: 10 × 9 × 5 × 5 = **2,250 queries**

## Recommended Approach

### Option A: Location-First (90 queries)
```
Group 1 (AND): San Francisco, Seattle
Group 2 (OR): Python, React, Node.js
Group 3 (AND): Software Engineer, Senior Software Engineer

Result: 2 × 3 × 2 = 12 queries
```

### Option B: Role-First (50 queries)
```
Group 1 (AND): Engineering Manager, Tech Lead
Group 2 (OR): AWS, Kubernetes, DevOps
Group 3 (AND): San Francisco

Result: 2 × 3 × 1 = 6 queries
```

### Option C: Skill-Based (60 queries)
```
Group 1 (AND): Machine Learning
Group 2 (OR): Python, TensorFlow, PyTorch
Group 3 (AND): Senior, Principal, Staff

Result: 1 × 3 × 3 = 9 queries
```

## Example Output Queries

1. `"Software Engineer" OR Python AND "San Francisco"`
2. `"Software Engineer" OR JavaScript AND "San Francisco"`
3. `"Software Engineer" OR React AND "San Francisco"`
4. `"Senior Software Engineer" OR Python AND Seattle`
5. `"Tech Lead" OR Kubernetes AND Austin`

## Search Configuration

### Recommended Settings
- **Parallel**: Enabled
- **Threads**: 5-8
- **Delay**: 2-3 seconds
- **Cache**: Enabled
- **Export**: ALL formats
- **Max Retries**: 3

### Expected Results
- Active tech professionals
- Current employment listings
- Skills and tech stack
- Location information
- Company affiliations

## Performance Estimate

| Queries | Parallel (5 threads) | Estimated Time |
|---------|---------------------|----------------|
| 12 | Yes | ~30 seconds |
| 50 | Yes | ~2 minutes |
| 90 | Yes | ~4 minutes |
| 450 | Yes | ~20 minutes |

## Use Cases

- **Recruiting**: Find candidates with specific skills
- **Market Research**: Analyze tech talent in regions
- **Networking**: Connect with professionals in your field
- **Competitive Analysis**: See where talent is concentrated
- **Job Search**: Find professionals at target companies

