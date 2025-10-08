# Query Builder Examples

This directory contains example configurations for the Advanced Query Builder feature in the React UI.

## 📚 Available Examples

1. **`stem-students-query-builder.md`** - Find STEM students at universities
2. **`tech-professionals.md`** - Find tech professionals by role and location
3. **`research-scientists.md`** - Find researchers in specific fields
4. **`startup-founders.md`** - Find startup founders and entrepreneurs

## 🎯 How to Use These Examples

1. Open React UI: `http://localhost:5174`
2. Click **"Query Builder"** button
3. Follow the group structure from any example
4. Add keywords to each group
5. Select AND/OR operators as specified
6. Click **"Generate Queries"**
7. Run search with generated queries

## 🔧 Query Builder Interface

The Query Builder lets you create complex Boolean search combinations:

- **Multiple Groups**: Add as many groups as needed
- **AND/OR Operators**: Choose logic for each group
- **Cartesian Product**: Automatically generates all combinations
- **Live Preview**: See query count in real-time
- **Copy Function**: Export all queries to clipboard

## 💡 Tips for Creating Effective Queries

### Start Specific
- Use specific university names
- Include degree levels
- Add field of study

### Combine Strategically
- AND for required terms (narrowing)
- OR for alternatives (broadening)
- Balance specificity vs. coverage

### Test Incrementally
1. Start with 2-3 groups
2. Generate and review queries
3. Add more groups if needed
4. Test with small batches first

## 📊 Query Count Formula

```
Total Queries = Group1_Count × Group2_Count × Group3_Count × ...
```

**Examples:**
- 3 × 2 × 5 = **30 queries**
- 5 × 1 × 10 × 2 = **100 queries**
- 2 × 3 × 4 × 5 = **120 queries**

## ⚠️ Performance Considerations

| Query Count | Recommended Settings |
|-------------|---------------------|
| 1-10 | Sequential, 2s delay |
| 10-50 | Parallel (3 threads), 2s delay |
| 50-100 | Parallel (5 threads), 3s delay |
| 100-200 | Parallel (5 threads), 3s delay, use cache |
| 200+ | Split into batches |

## 🎓 Learning Resources

See each example file for:
- Detailed group configurations
- Expected results
- Performance estimates
- Best practices
- Common pitfalls to avoid

