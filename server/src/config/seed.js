import pool from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const seedGrievances = async () => {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seed...\n');

    // First, get the user ID to assign grievances to
    const userResult = await client.query('SELECT id FROM users LIMIT 1');

    if (userResult.rows.length === 0) {
      console.error('❌ No users found in database. Please create a user first.');
      return;
    }

    const userId = userResult.rows[0].id;
    console.log(`✓ Found user ID: ${userId}\n`);

    await client.query('BEGIN');

    // Define realistic grievance data
    const grievances = [
      // 1. Article 8 - Overtime Violation (Informal Step A)
      {
        grievanceNumber: 'GRVNC-2024-0001',
        userId,
        grievantName: 'John Martinez',
        grievantEmployeeId: '98765432',
        facility: 'Brooklyn Main Post Office',
        craft: 'carrier',
        incidentDate: '2024-11-15',
        incidentTime: '17:30:00',
        contractArticle: 'Article 8 - Hours of Work',
        violationType: 'Overtime Distribution Violation',
        briefDescription: 'Management bypassed OTDL for overtime work',
        detailedDescription: 'On November 15, 2024, management assigned overtime work to a non-OTDL carrier while carriers on the Overtime Desired List were available and not utilized. This is a direct violation of Article 8.5.D regarding proper overtime distribution.',
        managementRepresentative: 'Supervisor James Wilson',
        witnesses: ['Sarah Johnson', 'Michael Chen'],
        currentStep: 'informal_step_a',
        status: 'active'
      },

      // 2. Article 16 - Discipline (Formal Step A)
      {
        grievanceNumber: 'GRVNC-2024-0002',
        userId,
        grievantName: 'Maria Garcia',
        grievantEmployeeId: '87654321',
        facility: 'Queens Distribution Center',
        craft: 'clerk',
        incidentDate: '2024-11-10',
        incidentTime: '09:15:00',
        contractArticle: 'Article 16 - Discipline',
        violationType: 'Unwarranted Discipline - Letter of Warning',
        briefDescription: 'Issued improper letter of warning without just cause',
        detailedDescription: 'Management issued a Letter of Warning on November 10, 2024 for alleged attendance issues. However, all absences were covered by approved FMLA leave. The discipline was issued without conducting a proper investigatory interview and without just cause as required by Article 16.',
        managementRepresentative: 'Manager Patricia Davis',
        witnesses: ['Robert Taylor'],
        currentStep: 'formal_step_a',
        status: 'active'
      },

      // 3. Article 7 - Seniority Violation (Informal Step A)
      {
        grievanceNumber: 'GRVNC-2024-0003',
        userId,
        grievantName: 'David Thompson',
        grievantEmployeeId: '76543210',
        facility: 'Bronx Main Post Office',
        craft: 'carrier',
        incidentDate: '2024-11-12',
        incidentTime: '08:00:00',
        contractArticle: 'Article 7 - Employee Classifications',
        violationType: 'Seniority Bypass - Route Assignment',
        briefDescription: 'Junior employee awarded route assignment over senior bidder',
        detailedDescription: 'Route 025 was awarded to a junior employee despite my senior bid. I have been a regular carrier for 8 years and was the senior qualified bidder. Management failed to follow proper bidding procedures outlined in Article 7.',
        managementRepresentative: 'Postmaster Linda Anderson',
        witnesses: ['Karen White', 'James Brown'],
        currentStep: 'informal_step_a',
        status: 'active'
      },

      // 4. Article 8 - Mandatory Overtime (Filed - Active)
      {
        grievanceNumber: 'GRVNC-2024-0004',
        userId,
        grievantName: 'Jennifer Lee',
        grievantEmployeeId: '65432109',
        facility: 'Manhattan Processing Center',
        craft: 'clerk',
        incidentDate: '2024-11-20',
        incidentTime: '16:00:00',
        contractArticle: 'Article 8 - Hours of Work',
        violationType: '12/60 Hour Rule Violation',
        briefDescription: 'Forced to work beyond 12 hours in a day',
        detailedDescription: 'On November 20, 2024, I was mandated to work 13.5 hours despite already working 11 hours. This violates the 12-hour daily maximum outlined in Article 8. I voiced my concern but was told I would face discipline if I left.',
        managementRepresentative: 'Supervisor Mark Johnson',
        witnesses: ['Thomas Miller'],
        currentStep: 'filed',
        status: 'active'
      },

      // 5. Article 14 - Safety Violation (Formal Step A)
      {
        grievanceNumber: 'GRVNC-2024-0005',
        userId,
        grievantName: 'Robert Wilson',
        grievantEmployeeId: '54321098',
        facility: 'Staten Island Post Office',
        craft: 'maintenance',
        incidentDate: '2024-11-08',
        incidentTime: '10:30:00',
        contractArticle: 'Article 14 - Safety and Health',
        violationType: 'Unsafe Working Conditions - Equipment',
        briefDescription: 'Required to use faulty equipment despite safety concerns',
        detailedDescription: 'Management insisted I continue using a hydraulic lift with known safety defects. I reported the issue on November 5th via PS Form 1767, but was ordered to use the equipment anyway. This creates an imminent danger and violates Article 14 safety requirements.',
        managementRepresentative: 'Maintenance Supervisor Gary Thomas',
        witnesses: ['Daniel Rodriguez', 'Kevin Anderson'],
        currentStep: 'formal_step_a',
        status: 'active'
      },

      // 6. Article 19 - Handbook Violation (Informal Step A)
      {
        grievanceNumber: 'GRVNC-2024-0006',
        userId,
        grievantName: 'Lisa Anderson',
        grievantEmployeeId: '43210987',
        facility: 'Brooklyn Main Post Office',
        craft: 'carrier',
        incidentDate: '2024-11-14',
        incidentTime: '12:00:00',
        contractArticle: 'Article 19 - Handbooks and Manuals',
        violationType: 'M-41 Violation - Lunch Break Denial',
        briefDescription: 'Denied proper 30-minute lunch break',
        detailedDescription: 'Supervisor ordered me to skip my lunch break to complete delivery. This violates M-41 Section 132 which mandates a 30-minute lunch period. When I insisted on taking my lunch, I was threatened with discipline for "unauthorized absence."',
        managementRepresentative: 'Supervisor Rachel Green',
        witnesses: ['Michelle Davis'],
        currentStep: 'informal_step_a',
        status: 'active'
      },

      // 7. Article 10 - Leave Denial (Formal Step A)
      {
        grievanceNumber: 'GRVNC-2024-0007',
        userId,
        grievantName: 'Michael Brown',
        grievantEmployeeId: '32109876',
        facility: 'Queens Distribution Center',
        craft: 'clerk',
        incidentDate: '2024-11-01',
        incidentTime: '08:00:00',
        contractArticle: 'Article 10 - Leave',
        violationType: 'Annual Leave Denial',
        briefDescription: 'Annual leave request improperly denied',
        detailedDescription: 'I submitted an annual leave request 45 days in advance for December 15-20, 2024. Management denied it citing "operational needs" despite having adequate staffing. Article 10 requires management to grant leave requests submitted well in advance unless emergency situations exist.',
        managementRepresentative: 'Manager Steven Clark',
        witnesses: ['Angela Martinez'],
        currentStep: 'formal_step_a',
        status: 'active'
      },

      // 8. Article 8 - Schedule Violation (Filed - Active)
      {
        grievanceNumber: 'GRVNC-2024-0008',
        userId,
        grievantName: 'Sarah Johnson',
        grievantEmployeeId: '21098765',
        facility: 'Bronx Main Post Office',
        craft: 'carrier',
        incidentDate: '2024-11-19',
        incidentTime: '07:00:00',
        contractArticle: 'Article 8 - Hours of Work',
        violationType: 'NS Day Violation',
        briefDescription: 'Forced to work scheduled non-scheduled day',
        detailedDescription: 'Management mandated me to work on my scheduled NS day (November 19, 2024) without following proper procedures. I was not on the overtime desired list and junior employees were not utilized first. This violates Article 8 overtime distribution provisions.',
        managementRepresentative: 'Supervisor Emily White',
        witnesses: ['Christopher Lee', 'Amanda Taylor'],
        currentStep: 'filed',
        status: 'active'
      },

      // 9. Article 16 - Suspension (Resolved - Grievance Won)
      {
        grievanceNumber: 'GRVNC-2024-0009',
        userId,
        grievantName: 'James Taylor',
        grievantEmployeeId: '10987654',
        facility: 'Manhattan Processing Center',
        craft: 'clerk',
        incidentDate: '2024-10-25',
        incidentTime: '14:00:00',
        contractArticle: 'Article 16 - Discipline',
        violationType: 'Emergency Suspension Without Just Cause',
        briefDescription: 'Emergency suspension issued without proper investigation',
        detailedDescription: 'I was placed on emergency suspension on October 25, 2024 without a proper investigatory interview. Management claimed "insubordination" but failed to provide specific details or conduct an investigation per Article 16 requirements. The suspension was arbitrary and without just cause.',
        managementRepresentative: 'Manager Brian Wilson',
        witnesses: ['Nicole Harris'],
        currentStep: 'resolved',
        status: 'resolved'
      },

      // 10. Article 8 - Overtime Pay (Resolved - Settled)
      {
        grievanceNumber: 'GRVNC-2024-0010',
        userId,
        grievantName: 'Patricia Martinez',
        grievantEmployeeId: '09876543',
        facility: 'Staten Island Post Office',
        craft: 'carrier',
        incidentDate: '2024-10-15',
        incidentTime: '18:30:00',
        contractArticle: 'Article 8 - Hours of Work',
        violationType: 'Unpaid Overtime',
        briefDescription: 'Overtime hours worked but not compensated',
        detailedDescription: 'I worked 3.5 hours of overtime on October 15, 2024 but was only paid for 2 hours. My time card clearly shows clock-in at 7:00 AM and clock-out at 7:30 PM (12.5 hours total). Management claims I took an extended lunch, but I took only my authorized 30 minutes.',
        managementRepresentative: 'Supervisor Donald Brown',
        witnesses: ['William Jackson', 'Elizabeth Moore'],
        currentStep: 'resolved',
        status: 'settled'
      }
    ];

    console.log('📝 Inserting grievances...\n');

    for (const grievance of grievances) {
      // Insert grievance
      const grievanceResult = await client.query(
        `INSERT INTO grievances (
          grievance_number, user_id, grievant_name, grievant_employee_id,
          facility, craft, incident_date, incident_time, contract_article,
          violation_type, brief_description, detailed_description,
          management_representative, witnesses, current_step, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id, grievance_number`,
        [
          grievance.grievanceNumber,
          grievance.userId,
          grievance.grievantName,
          grievance.grievantEmployeeId,
          grievance.facility,
          grievance.craft,
          grievance.incidentDate,
          grievance.incidentTime,
          grievance.contractArticle,
          grievance.violationType,
          grievance.briefDescription,
          grievance.detailedDescription,
          grievance.managementRepresentative,
          grievance.witnesses,
          grievance.currentStep,
          grievance.status
        ]
      );

      const insertedId = grievanceResult.rows[0].id;
      const grievanceNum = grievanceResult.rows[0].grievance_number;

      // Add timeline entry
      await client.query(
        `INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          insertedId,
          'filed',
          grievance.incidentDate,
          userId,
          `Grievance filed by ${grievance.grievantName}`
        ]
      );

      // Add additional timeline entries for non-filed statuses
      if (grievance.currentStep !== 'filed') {
        const stepDate = new Date(grievance.incidentDate);
        stepDate.setDate(stepDate.getDate() + 3); // 3 days after filing

        await client.query(
          `INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            insertedId,
            grievance.currentStep,
            stepDate,
            userId,
            `Advanced to ${grievance.currentStep.replace(/_/g, ' ')}`
          ]
        );
      }

      // Add deadline for active grievances
      if (grievance.status === 'active') {
        const deadlineDate = new Date(grievance.incidentDate);
        deadlineDate.setDate(deadlineDate.getDate() + 14); // 14 days from incident

        await client.query(
          `INSERT INTO deadlines (grievance_id, deadline_type, deadline_date, description)
           VALUES ($1, $2, $3, $4)`,
          [
            insertedId,
            'management_response',
            deadlineDate,
            'Management must respond to grievance'
          ]
        );
      }

      console.log(`  ✓ ${grievanceNum}: ${grievance.violationType} (${grievance.currentStep})`);
    }

    await client.query('COMMIT');

    console.log('\n✅ Successfully seeded 10 grievances!');
    console.log('\n📊 Summary:');
    console.log('  • 2 Filed (Active)');
    console.log('  • 3 Informal Step A');
    console.log('  • 3 Formal Step A');
    console.log('  • 1 Resolved');
    console.log('  • 1 Settled');
    console.log('\n🎯 You can now view these in the dashboard at http://localhost:5173');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the seed function
seedGrievances()
  .then(() => {
    console.log('\n✨ Seed completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Seed failed:', err);
    process.exit(1);
  });
