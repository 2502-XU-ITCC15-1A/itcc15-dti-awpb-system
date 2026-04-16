# AWPB System Entity Relationships

## Core Entities

### 1. Users
- **id** (UUID, Primary Key)
- **username** (Text, Unique)
- **full_name** (Text)
- **email** (Text, Unique)
- **password_hash** (Text)
- **role** (Enum: admin, encoder)
- **status** (Enum: active, deactivated)
- **created_at** (Timestamp)
- **updated_at** (Timestamp)

### 2. Units
- **id** (UUID, Primary Key)
- **code** (Text, Unique) - RCU, BKD, LDN, MIS OR
- **name** (Text)
- **aliases** (JSON array) - ["RCU"], ["BKD", "Bukidnon"]
- **is_active** (Boolean)
- **created_at** (Timestamp)

### 3. Components
- **id** (UUID, Primary Key)
- **name** (Text) - "COMPONENT 1: DIRECT ASSISTANCE TO ENTERPRISE"
- **code** (Text) - "COMPONENT_1"
- **sort_order** (Integer)
- **is_active** (Boolean)
- **created_at** (Timestamp)

### 4. Sub_Components
- **id** (UUID, Primary Key)
- **component_id** (UUID, Foreign Key → Components)
- **name** (Text) - "Sub component 1.1 Business Services"
- **code** (Text) - "SUB_COMP_1_1"
- **sort_order** (Integer)
- **is_active** (Boolean)
- **created_at** (Timestamp)

### 5. Key_Activities
- **id** (UUID, Primary Key)
- **sub_component_id** (UUID, Foreign Key → Sub_Components)
- **name** (Text) - "1.1.1 Business Development Services"
- **code** (Text) - "KEY_ACT_1_1_1"
- **activity_no** (Text) - "1", "2", "3"
- **performance_indicator** (Text)
- **sort_order** (Integer)
- **is_active** (Boolean)
- **created_at** (Timestamp)

### 6. Sub_Activities
- **id** (UUID, Primary Key)
- **key_activity_id** (UUID, Foreign Key → Key_Activities)
- **name** (Text) - "1.1.3.a Productivity/ Techno Transfer..."
- **code** (Text) - "SUB_ACT_1_1_3_a"
- **sort_order** (Integer)
- **is_active** (Boolean)
- **created_at** (Timestamp)

### 7. Entries (AWPB Entries)
- **id** (UUID, Primary Key)
- **owner_id** (UUID, Foreign Key → Users)
- **unit_id** (UUID, Foreign Key → Units)
- **planning_year** (Integer)
- **component_id** (UUID, Foreign Key → Components)
- **sub_component_id** (UUID, Foreign Key → Sub_Components)
- **key_activity_id** (UUID, Foreign Key → Key_Activities)
- **sub_activity_id** (UUID, Foreign Key → Sub_Activities, Nullable)
- **title_of_activities** (Text)
- **unit_cost** (Decimal)
- **status** (Enum: draft, submitted, Pending Review, Returned, Approved, Rejected)
- **submission_date** (Timestamp)
- **review_date** (Timestamp)
- **reviewer_id** (UUID, Foreign Key → Users, Nullable)
- **reviewer_notes** (Text)
- **created_at** (Timestamp)
- **updated_at** (Timestamp)

### 8. Monthly_Targets
- **id** (UUID, Primary Key)
- **entry_id** (UUID, Foreign Key → Entries)
- **month** (Enum: jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
- **target_quantity** (Decimal)
- **created_at** (Timestamp)
- **updated_at** (Timestamp)

### 9. Submission_Windows
- **id** (UUID, Primary Key)
- **title** (Text)
- **start_date** (Date)
- **end_date** (Date)
- **is_active** (Boolean)
- **created_at** (Timestamp)

## Relationships

1. **Users → Entries** (One to Many)
   - A user can have many entries
   - An entry belongs to one user (owner)
   - Users can also be reviewers (self-referencing)

2. **Units → Entries** (One to Many)
   - A unit can have many entries
   - An entry belongs to one unit

3. **Components → Sub_Components** (One to Many)
   - A component has many sub-components
   - A sub-component belongs to one component

4. **Sub_Components → Key_Activities** (One to Many)
   - A sub-component has many key activities
   - A key activity belongs to one sub-component

5. **Key_Activities → Sub_Activities** (One to Many)
   - A key activity has many sub-activities
   - A sub-activity belongs to one key activity

6. **Entries → Monthly_Targets** (One to Many)
   - An entry has 12 monthly targets (one for each month)
   - A monthly target belongs to one entry

7. **Users → Entries** (Reviewer relationship)
   - A user can review many entries
   - An entry can have one reviewer (admin)

## Data Flow

1. **Template Hierarchy**: Units → Components → Sub_Components → Key_Activities → Sub_Activities
2. **Entry Creation**: User selects from template hierarchy and creates entry with monthly targets
3. **Review Workflow**: Draft → Submitted → Pending Review → Approved/Rejected/Returned
