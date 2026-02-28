# Pharmacy HR AI Agent - Training Dataset
Generated: 2026-02-28 05:55:58

## Dataset Overview
Complete synthetic training dataset for fine-tuning and RAG pipelines for the PharmAssist HR Agent system.

### Files Generated
- **employees_dataset.csv** - 500 French pharmacy employees with roles, contracts, qualifications
- **schedules_dataset.csv** - 83137 weekly work schedules with compliance validation
- **absences_dataset.csv** - 3000 absence requests with approval workflow
- **compliance_rules.json** - 9 French labor law rules (Art. L3121-27, L3121-20, etc.)
- **conversations.jsonl** - 10000 conversation pairs for fine-tuning (1000 examples)
- **qa_pairs.jsonl** - 500 Q&A pairs for RAG training (500 examples)
- **edge_cases.jsonl** - 500 complex scenarios for advanced reasoning (100 examples)

## Dataset Statistics
- **Total Employees**: 500
- **Total Schedules**: 83137
- **Total Absences**: 3000
- **Compliance Rules**: 9
- **Conversation Examples**: 10000
- **Q&A Pairs**: 500
- **Edge Cases**: 500
- **Language**: French
- **Time Period**: 2024-2026
- **Compliance Examples**: 85% compliant, 15% violations

## French Labor Law Coverage
All 9 major compliance rules implemented:
1. **ART_L3121_27** - Durée légale hebdomadaire (35h)
2. **ART_L3121_20** - Durée maximale absolue (48h)
3. **ART_L3121_31** - Repos quotidien (11h)
4. **ART_L3132_2** - Repos hebdomadaire (1 jour)
5. **ART_L3121_16** - Pause après 6h
6. **ART_L3122_7** - Durée maximale quotidienne (10h)
7. **ART_L3131_5** - Nuit max 8h
8. **ART_L5125_4** - Pharmacien obligatoire
9. **ART_L3141_3** - Congés payés (25 jours)

## Data Quality
- Realistic French names, cities, pharmacy names
- Consistent employee IDs across files
- Proper date ranges and constraints
- Professional French language
- No sensitive personal information
- All fields validated for coherence

## Usage

### Fine-tuning (OpenAI)
```python
import json
with open('conversations.jsonl', 'r') as f:
    data = [json.loads(line) for line in f]
# Upload to OpenAI fine-tuning API
```

### RAG Pipeline (LangChain)
```python
import json
with open('qa_pairs.jsonl', 'r') as f:
    for line in f:
        qa = json.loads(line)
        # Index with your vector store
```

### Pandas Analysis
```python
import pandas as pd
schedules = pd.read_csv('schedules_dataset.csv')
violations = schedules[~schedules['is_compliant']]
```

### Direct Claude Context
```python
import json
with open('compliance_rules.json', 'r') as f:
    rules = json.load(f)
# Inject into system prompt for compliance checking
```

## License
CC BY 4.0 - Attribution required

## Citation
If you use this dataset, please cite:
```
PharmAssist HR Agent Training Dataset (2024)
Generated for Data2Innov Hackathon
French Pharmacy HR Management System
```
