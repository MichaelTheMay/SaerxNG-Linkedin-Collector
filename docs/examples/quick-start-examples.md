# Query Builder Quick Start Examples

Simple examples to get started with the Advanced Query Builder.

## 🎓 Example 1: University Students (Simple)

**Goal**: Find Computer Science students at top schools

### Configuration
```
Group 1 (OR): Stanford, MIT, Harvard
Group 2 (AND): Computer Science
Group 3 (OR): student, PhD, graduate

Generates: 3 × 1 × 3 = 9 queries
```

### How to Build
1. Open Query Builder
2. Group 1: Add "Stanford", "MIT", "Harvard", set to OR
3. Click "Add Group"
4. Group 2: Add "Computer Science", set to AND
5. Click "Add Group"
6. Group 3: Add "student", "PhD", "graduate", set to OR
7. Click "Generate Queries"

### Expected Results
- Stanford Computer Science student
- MIT Computer Science PhD
- Harvard Computer Science graduate
- (6 more combinations)

---

## 💼 Example 2: Job Roles (Medium)

**Goal**: Find engineering managers in tech hubs

### Configuration
```
Group 1 (AND): San Francisco, Seattle, New York
Group 2 (OR): Engineering Manager, Director of Engineering
Group 3 (AND): Software, Technology

Generates: 3 × 2 × 2 = 12 queries
```

### Sample Queries Generated
1. `"San Francisco" OR "Engineering Manager" AND Software`
2. `"San Francisco" OR "Director of Engineering" AND Software`
3. `Seattle OR "Engineering Manager" AND Technology`
4. (9 more...)

---

## 🔬 Example 3: Research Scientists (Advanced)

**Goal**: Find AI researchers at universities

### Configuration
```
Group 1 (OR): Stanford, MIT, UC Berkeley, CMU
Group 2 (AND): Artificial Intelligence, Machine Learning
Group 3 (OR): Professor, Research Scientist, Postdoc
Group 4 (AND): PhD

Generates: 4 × 2 × 3 × 1 = 24 queries
```

### Why This Works
- Combines multiple universities (OR = any of these)
- Requires AI/ML focus (AND = must have)
- Includes various research positions (OR = any role)
- Requires PhD qualification (AND = must have)

---

## 🚀 Example 4: Startup Founders (Targeted)

**Goal**: Find startup founders in specific industries

### Configuration
```
Group 1 (AND): Founder, Co-Founder, CEO
Group 2 (OR): AI, Blockchain, Fintech, HealthTech
Group 3 (AND): startup, company

Generates: 3 × 4 × 2 = 24 queries
```

---

## 📊 Example 5: Data Professionals (Precise)

**Goal**: Find data scientists at FAANG companies

### Configuration
```
Group 1 (OR): Google, Meta, Amazon, Apple, Netflix
Group 2 (AND): Data Scientist, ML Engineer
Group 3 (OR): Senior, Staff, Principal

Generates: 5 × 2 × 3 = 30 queries
```

---

## 🎯 Best Practices from Examples

### 1. Use AND for Required Terms
- University name (must have)
- Specific field (must have)
- Company name (must have)

### 2. Use OR for Alternatives
- Multiple schools
- Various job titles
- Different skill terms

### 3. Order Matters
- Start with most specific (location, company)
- Then role/field
- Then level/status

### 4. Keep It Manageable
- Start with < 50 queries
- Test and refine
- Scale up gradually

## 🧪 Testing Your Queries

### Before Running Full Search
1. Generate queries in Query Builder
2. Review in preview panel
3. Copy 2-3 sample queries
4. Test manually in SearxNG
5. Adjust groups as needed
6. Re-generate and run full search

### Quality Checks
- Are queries too broad? (Add AND groups)
- Too narrow? (Add OR alternatives)
- Getting duplicates? (Refine groups)
- Wrong profiles? (Adjust keywords)

## 💡 Pro Tips

1. **Quote Multi-word Terms**: Query Builder does this automatically
2. **Start Specific, Then Broaden**: Easier to add than remove
3. **Use Parallel Mode**: For 20+ queries
4. **Enable Caching**: Save time on repeated queries
5. **Export All Formats**: Get CSV for Excel, JSON for programming
6. **Monitor Progress**: Watch console for errors

## 📈 Success Metrics

After running queries, check:
- **Total Profiles Found**: Aim for 50-500 per batch
- **Unique URLs**: Deduplication should be 80%+
- **Relevance**: Sample 10 results for quality
- **Coverage**: Are key targets included?

## 🎬 Quick Start Workflow

1. **Open UI**: `http://localhost:5174`
2. **Test Connection**: Verify SearxNG is running
3. **Open Query Builder**: Click green button
4. **Choose Example**: Pick one from above
5. **Build Groups**: Follow the configuration
6. **Generate**: Click generate button
7. **Review**: Check generated queries
8. **Search**: Click "Run Search"
9. **Export**: Get results in all formats

## 📝 Notes

- Query Builder uses Cartesian product (all combinations)
- Each group multiplies the total query count
- More groups = exponentially more queries
- Balance coverage vs. specificity
- Test small before scaling up

## 🎉 Success Story

**Scenario**: Find Stanford AI PhDs

**Setup**:
```
Group 1: Stanford
Group 2: Artificial Intelligence, Machine Learning, Deep Learning  
Group 3: PhD, PhD student, Doctoral

Result: 1 × 3 × 3 = 9 queries
Time: ~30 seconds
Profiles: 25-50 unique results
```

**Outcome**: Highly targeted list of Stanford AI PhDs in minutes!

