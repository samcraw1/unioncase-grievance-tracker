# USPS Contract Articles Reference

This document provides common USPS contract articles and violation types for use in the grievance tracker application.

## Common Contract Articles

### Article 3 - Management Rights
- Management's rights and limitations
- Work assignments
- Discipline procedures

### Article 5 - Prohibition of Unilateral Action
- Changes to working conditions
- Notification requirements

### Article 7 - Employee Classifications
- Craft definitions
- Position classifications
- Transitional employees

### Article 8 - Hours of Work
- **Most Common for Grievances**
- Work schedules
- Overtime violations
- OTDL (Overtime Desired List)
- Work assignment list violations
- 12-hour/60-hour rule violations

### Article 10 - Leave
- Annual leave
- Sick leave
- FMLA leave
- Leave denial

### Article 11 - Holidays
- Holiday scheduling
- Holiday pay
- Forced overtime on holidays

### Article 12 - Principles of Seniority
- Seniority rights
- Seniority violations
- Route assignments

### Article 14 - Safety and Health
- Unsafe working conditions
- Equipment violations
- Vehicle safety

### Article 15 - Grievance Procedure
- Processing grievances
- Time limits
- Grievance settlements

### Article 16 - Discipline
- Disciplinary actions
- Progressive discipline
- Suspension
- Removal

### Article 17 - Representation
- Union representation rights
- Weingarten rights
- Investigatory interviews

### Article 19 - Handbooks and Manuals
- ELM (Employee Labor Manual)
- M-39 (Management of Delivery Services)
- M-41 (City Delivery Carriers Duties and Responsibilities)

### Article 21 - Benefit Plans
- Health insurance
- Life insurance
- FEHB issues

### Article 31 - Union-Management Relations
- Labor-management cooperation
- Steward rights

### Article 34 - Work and Time Standards
- Route inspections
- Count inspections
- Overburdening

### Article 41 - Subcontracting
- Work assignments to contractors
- HCR (Highway Contract Routes)

## Common Violation Types

### Overtime Violations
- Improper overtime distribution
- OTDL violations
- Work assignment list violations
- Off-day violations
- Mandatory overtime violations
- 12/60 hour violations

### Seniority Violations
- Route assignment violations
- Bid violations
- Hold down violations
- Opt violations

### Discipline Issues
- Unwarranted discipline
- Letter of warning
- Suspension
- Removal
- Emergency suspension
- Discipline without just cause

### Leave Violations
- Annual leave denial
- Sick leave denial
- FMLA interference
- Administrative leave issues

### Safety Violations
- Unsafe working conditions
- Inadequate training
- Equipment failures
- Vehicle safety issues
- Hazardous materials

### Schedule Violations
- NS day violations
- Schedule changes without notice
- Improper work assignments

### Pay Issues
- Unpaid overtime
- Penalty pay violations
- Holiday pay issues
- Incorrect pay rate

### Harassment/Discrimination
- Hostile work environment
- Discrimination
- Retaliation
- Unfair treatment

### Route Issues
- Overburdened route
- Route adjustment violations
- Count/inspection issues
- Unauthorized route changes

### CCA/PSE Issues (Transitional Employees)
- Improper use of CCAs
- Conversion rights violations
- Work hour violations
- RIF (Reduction in Force) violations

### Article 19 Violations (Handbook)
- M-39 violations
- M-41 violations
- ELM violations
- Improper policies

### Steward Rights Violations
- Denial of representation
- Weingarten violations
- Steward time denial
- Interference with union duties

## Usage in Application

These contract articles and violation types should be used to populate dropdown menus in the grievance form, allowing users to:

1. Select the primary contract article violated
2. Choose from common violation types
3. Add custom violation descriptions when needed

### Suggested Data Structure

```javascript
const contractArticles = [
  { value: 'article_3', label: 'Article 3 - Management Rights' },
  { value: 'article_5', label: 'Article 5 - Prohibition of Unilateral Action' },
  { value: 'article_7', label: 'Article 7 - Employee Classifications' },
  { value: 'article_8', label: 'Article 8 - Hours of Work' },
  { value: 'article_10', label: 'Article 10 - Leave' },
  { value: 'article_11', label: 'Article 11 - Holidays' },
  { value: 'article_12', label: 'Article 12 - Principles of Seniority' },
  { value: 'article_14', label: 'Article 14 - Safety and Health' },
  { value: 'article_15', label: 'Article 15 - Grievance Procedure' },
  { value: 'article_16', label: 'Article 16 - Discipline' },
  { value: 'article_17', label: 'Article 17 - Representation' },
  { value: 'article_19', label: 'Article 19 - Handbooks and Manuals' },
  { value: 'article_21', label: 'Article 21 - Benefit Plans' },
  { value: 'article_31', label: 'Article 31 - Union-Management Relations' },
  { value: 'article_34', label: 'Article 34 - Work and Time Standards' },
  { value: 'article_41', label: 'Article 41 - Subcontracting' },
  { value: 'other', label: 'Other' }
];

const violationTypes = [
  // Overtime
  { category: 'Overtime', value: 'overtime_distribution', label: 'Improper Overtime Distribution' },
  { category: 'Overtime', value: 'otdl_violation', label: 'OTDL Violation' },
  { category: 'Overtime', value: '12_60_violation', label: '12/60 Hour Violation' },

  // Seniority
  { category: 'Seniority', value: 'route_assignment', label: 'Route Assignment Violation' },
  { category: 'Seniority', value: 'bid_violation', label: 'Bid Violation' },

  // Discipline
  { category: 'Discipline', value: 'unwarranted_discipline', label: 'Unwarranted Discipline' },
  { category: 'Discipline', value: 'suspension', label: 'Suspension' },
  { category: 'Discipline', value: 'removal', label: 'Removal' },

  // Leave
  { category: 'Leave', value: 'annual_leave_denial', label: 'Annual Leave Denial' },
  { category: 'Leave', value: 'sick_leave_denial', label: 'Sick Leave Denial' },
  { category: 'Leave', value: 'fmla_violation', label: 'FMLA Violation' },

  // Safety
  { category: 'Safety', value: 'unsafe_conditions', label: 'Unsafe Working Conditions' },
  { category: 'Safety', value: 'equipment_failure', label: 'Equipment/Vehicle Safety' },

  // Other
  { category: 'Other', value: 'harassment', label: 'Harassment/Discrimination' },
  { category: 'Other', value: 'pay_issue', label: 'Pay Issue' },
  { category: 'Other', value: 'schedule_violation', label: 'Schedule Violation' },
  { category: 'Other', value: 'other', label: 'Other' }
];
```

## Grievance Steps Reference

### Step Process Timeline

1. **Filing** - Day 0
   - Grievance must be filed within 14 days of incident (or when employee became aware)

2. **Informal Step A** - Within 14 days of filing
   - Discussion between supervisor and steward
   - Attempt to resolve informally

3. **Formal Step A** - If not resolved at Informal
   - Written grievance filed
   - Management has 7 days to respond (city delivery)
   - Management has 10 days to respond (clerk craft)

4. **Step B** - If not resolved at Formal Step A
   - Appealed to higher-level management
   - District-level review
   - Management has 10 days to respond

5. **Arbitration** - If not resolved at Step B
   - Case goes to neutral arbitrator
   - Binding decision

### Common Deadlines

- **Initial Filing**: 14 calendar days from incident
- **Informal Step A Meeting**: Within 14 days of filing
- **Formal Step A Response**: 7-10 days (depending on craft)
- **Appeal to Step B**: 7 days after Step A decision
- **Step B Response**: 10 days
- **Appeal to Arbitration**: 15 days after Step B decision

Note: Time limits can vary by craft and specific contract language. Always verify with current contract.

## Resources

- [NALC Contract](https://www.nalc.org/workplace-issues/contract-administration)
- [APWU Contract](https://www.apwu.org/resources/collective-bargaining-agreement)
- National Association of Letter Carriers resources
- American Postal Workers Union resources

---

**Note**: This reference is for general guidance. Always consult the most current version of the National Agreement and local memorandums of understanding (LMOU) for specific contract language and interpretations.
