-- Seed data for AWPB database
-- Populates the template hierarchy from frontend data

-- Insert Sub_Components and Key_Activities based on frontend awpb_dropdown_tree.json

-- COMPONENT 1: DIRECT ASSISTANCE TO ENTERPRISE
INSERT INTO sub_components (component_id, name, code, sort_order) VALUES
((SELECT id FROM components WHERE code = 'COMPONENT_1'), 'Sub component 1.1 Business Services', 'SUB_COMP_1_1', 1),
((SELECT id FROM components WHERE code = 'COMPONENT_1'), 'Sub component 1.2 Market Linkage', 'SUB_COMP_1_2', 2),
((SELECT id FROM components WHERE code = 'COMPONENT_1'), 'Sub component 1.3 Innovation and Technology Support', 'SUB_COMP_1_3', 3);

-- Key Activities for Sub component 1.1 Business Services
INSERT INTO key_activities (sub_component_id, name, code, activity_no, performance_indicator, sort_order) VALUES
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_1_1'), '1.1.1 Business Development Services', 'KEY_ACT_1_1_1', '1', 'Number of qualified BDS providers engaged for RAPID beneficiaries', 1),
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_1_1'), '1.1.2 Profiling', 'KEY_ACT_1_1_2', '2', 'Number of Farmer HHs beneficiaries Profiled', 2),
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_1_1'), '1.1.3 Capacity Building', 'KEY_ACT_1_1_3', '5', 'Number of capacity building activities conducted', 3),
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_1_1'), '1.1.4 Product Development Assistance/ Consultancy Services', 'KEY_ACT_1_1_4', '7', 'Number of product development assistance provided', 4);

-- Sub-Activities for Capacity Building (1.1.3)
INSERT INTO sub_activities (key_activity_id, name, code, sort_order) VALUES
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.a Productivity/ Techno Transfer-- # of Capability Building, Productivity quality standard and other techno transfer trainings conducted', 'SUB_ACT_1_1_3_a', 1),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.b Productivity/ Techno Transfer-- # of Benchmarking, Learning Visit and study mission conducted', 'SUB_ACT_1_1_3_b', 2),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.c Enterprise Development-- # of Entreprenuerial capability building and development trainings', 'SUB_ACT_1_1_3_c', 3),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.d Enterprise Development-- # of Youth Enterpreneurship Dev''t Initiatives', 'SUB_ACT_1_1_3_d', 4),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.e Matching Grant for Value adding production and logistics-- # of technical support trainings conducted', 'SUB_ACT_1_1_3_e', 5),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.f Matching Grant for SALT  (100% grant)-- # of SALT Training conducted', 'SUB_ACT_1_1_3_f', 6),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.g Matching Grant for Crop Rehabilitation/ Rejuvenation-- # of trainings on crop rehab/ rejuvenation conducted', 'SUB_ACT_1_1_3_g', 7),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.h Capability building of LGUs for -- # of capacity development activities', 'SUB_ACT_1_1_3_h', 8),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.i Capability building of LGUs for -- # of orientation / workshop/ meetings capacity development activities on FMI Implementation Arrangements', 'SUB_ACT_1_1_3_i', 9),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_3'), '1.1.3.j Institutional Development Training-- # Insti Devt Training conducted to FAs, Coops, MSMEs', 'SUB_ACT_1_1_3_j', 10);

-- Sub-Activities for Product Development (1.1.4)
INSERT INTO sub_activities (key_activity_id, name, code, sort_order) VALUES
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_4'), '1.1.4.a Product Development -- # of product devt activities organized', 'SUB_ACT_1_1_4_a', 1),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_4'), '1.1.4.b Product Development -- # of Brand Equity Dev''t Workshop Conducted', 'SUB_ACT_1_1_4_b', 2),
((SELECT id FROM key_activities WHERE code = 'KEY_ACT_1_1_4'), '1.1.4.c Technology Innovation-- # of Agricultural productions and value-adding innovation technologies/ solutions developed and introduced', 'SUB_ACT_1_1_4_c', 3);

-- COMPONENT 2: PROJECT MANAGEMENT
INSERT INTO sub_components (component_id, name, code, sort_order) VALUES
((SELECT id FROM components WHERE code = 'COMPONENT_2'), 'Sub component 2.1 Project Management Unit', 'SUB_COMP_2_1', 1);

-- Key Activities for Project Management
INSERT INTO key_activities (sub_component_id, name, code, activity_no, performance_indicator, sort_order) VALUES
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_2_1'), '2.1.a Project Management Unit setup-- # of RAPID Project Management Unit Cap Dev Staff hired (12 months)', 'KEY_ACT_2_1_a', '1', 'Number of PMU staff hired', 1);

-- COMPONENT 3: CAPACITY BUILDING
INSERT INTO sub_components (component_id, name, code, sort_order) VALUES
((SELECT id FROM components WHERE code = 'COMPONENT_3'), 'Sub component 3.1 Training and Awareness', 'SUB_COMP_3_1', 1);

-- Key Activities for Capacity Building
INSERT INTO key_activities (sub_component_id, name, code, activity_no, performance_indicator, sort_order) VALUES
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_3_1'), '3.1.a Training, Conduct of Awareness and promotional activities on innovative fund, Seminar and workshops on equity venuture capital and other innovative financing product -- # of training/study visit conducted', 'KEY_ACT_3_1_a', '1', 'Number of training/study visit conducted', 1),
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_3_1'), '3.1.b Training, Conduct of Awareness and promotional activities on innovative fund, Seminar and workshops on equity venuture capital and other innovative financing product -- # of seminars/workshops conducted', 'KEY_ACT_3_1_b', '2', 'Number of seminars/workshops conducted', 2);

-- COMPONENT 4: INNOVATIVE FINANCING
INSERT INTO sub_components (component_id, name, code, sort_order) VALUES
((SELECT id FROM components WHERE code = 'COMPONENT_4'), 'Sub component 4.1 Equity Venture Capital', 'SUB_COMP_4_1', 1),
((SELECT id FROM components WHERE code = 'COMPONENT_4'), 'Sub component 4.2 Matching Grant', 'SUB_COMP_4_2', 2),
((SELECT id FROM components WHERE code = 'COMPONENT_4'), 'Sub component 4.3 SBC Personnel', 'SUB_COMP_4_3', 3);

-- Key Activities for Innovative Financing
INSERT INTO key_activities (sub_component_id, name, code, activity_no, performance_indicator, sort_order) VALUES
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_4_1'), '4.1.a Training, Conduct of Awareness and promotional activities on innovative fund, Seminar and workshops on equity venuture capital and other innovative financing product -- # of training/study visit conducted', 'KEY_ACT_4_1_a', '1', 'Number of training/study visit conducted', 1),
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_4_2'), '4.2.a Matching Grant for Value adding production and logistics-- Amount of Loan Released', 'KEY_ACT_4_2_a', '1', 'Amount of Loan Released', 2),
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_4_3'), '4.3.a Training, Conduct of Awareness and promotional activities on innovative fund, Seminar and workshops on equity venuture capital and other innovative financing product -- #  of SBC personnel hired', 'KEY_ACT_4_3_a', '1', 'Number of SBC personnel hired', 3),
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_4_3'), '4.3.b Training, Conduct of Awareness and promotional activities on innovative fund, Seminar and workshops on equity venuture capital and other innovative financing product -- # of promo materials prepared', 'SUB_ACT_4_3_b', '2', 'Number of promo materials prepared', 4),
((SELECT id FROM sub_components WHERE code = 'SUB_COMP_4_3'), '4.3.c Equity Venture Capital-- Amount of Loan Released', 'KEY_ACT_4_3_c', '3', 'Amount of Loan Released', 5);

-- Create a function to initialize monthly targets for new entries
CREATE OR REPLACE FUNCTION initialize_monthly_targets(entry_uuid UUID)
RETURNS VOID AS $$
DECLARE
    month_val month_type;
BEGIN
    FOREACH month_val IN ARRAY ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    LOOP
        INSERT INTO monthly_targets (entry_id, month, target_quantity)
        VALUES (entry_uuid, month_val, 0)
        ON CONFLICT (entry_id, month) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically initialize monthly targets when an entry is created
CREATE OR REPLACE FUNCTION auto_create_monthly_targets()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM initialize_monthly_targets(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_monthly_targets
    AFTER INSERT ON entries
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_monthly_targets();
