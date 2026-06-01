// src/services/student-master-complete.service.ts
// Student Master Module Service - Complete Implementation

import { PrismaClient } from '@prisma/client';
import {
  StudentProfile,
  StudentParent,
  StudentAcademicRecord,
  StudentFee,
  StudentTutorWard,
  CreateParentRequest,
  UpdateParentRequest,
  CreateAcademicRecordRequest,
  CreateFeeRequest,
  RecordFeePaymentRequest,
  AssignTutorWardRequest,
  UpdateTutorWardRequest,
  StudentDashboardResponse,
  StudentFeeSummary,
} from '../types/student-master.types';

const prisma = new PrismaClient();

// ============================================================================
// STUDENT PROFILE MANAGEMENT
// ============================================================================

export const getStudentProfile = async (studentId: string) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
            phoneNumber: true,
            mobileNumber: true,
          },
        },
        primaryAdvisor: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    const profile: StudentProfile = {
      id: student.id,
      userId: student.userId,
      studentId: student.studentId,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      dateOfBirth: student.user.dateOfBirth || new Date(),
      degreeProgram: student.degreeProgram,
      majorId: student.majorId,
      minorId: student.minorId || undefined,
      concentrationId: student.concentrationId || undefined,
      enrollmentStatus: student.enrollmentStatus,
      enrollmentDate: student.enrollmentDate,
      expectedGraduationDate: student.expectedGraduationDate || undefined,
      graduationDate: student.graduationDate || undefined,
      currentGpa: student.currentGpa
        ? parseFloat(student.currentGpa.toString())
        : undefined,
      cumulativeGpa: student.cumulativeGpa
        ? parseFloat(student.cumulativeGpa.toString())
        : undefined,
      academicStanding: student.academicStanding,
      creditsEarned: student.creditsEarned,
      creditsRequired: student.creditsRequired || undefined,
      hasFinancialHold: student.hasFinancialHold,
      primaryAdvisorId: student.primaryAdvisorId || undefined,
      primaryAdvisorName: student.primaryAdvisor
        ? `${student.primaryAdvisor.user.firstName} ${student.primaryAdvisor.user.lastName}`
        : undefined,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };

    return { success: true, profile };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const updateStudentProfile = async (
  studentId: string,
  data: Partial<StudentProfile>
) => {
  try {
    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        degreeProgram: data.degreeProgram,
        majorId: data.majorId,
        minorId: data.minorId,
        concentrationId: data.concentrationId,
        enrollmentStatus: data.enrollmentStatus,
        expectedGraduationDate: data.expectedGraduationDate
          ? new Date(data.expectedGraduationDate)
          : undefined,
        currentGpa: data.currentGpa,
        cumulativeGpa: data.cumulativeGpa,
        academicStanding: data.academicStanding,
        creditsEarned: data.creditsEarned,
        hasFinancialHold: data.hasFinancialHold,
      },
    });

    return { success: true, message: 'Profile updated successfully', student };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// PARENT/GUARDIAN MANAGEMENT
// ============================================================================

export const addParent = async (
  studentId: string,
  data: CreateParentRequest
) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    const parent = await prisma.studentParent.create({
      data: {
        studentId,
        parentName: data.parentName,
        relationship: data.relationship,
        email: data.email,
        phoneNumber: data.phoneNumber,
        mobileNumber: data.mobileNumber,
        profession: data.profession,
        organization: data.organization,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        aadharNumber: data.aadharNumber,
        panNumber: data.panNumber,
        isEmergencyContact: data.isEmergencyContact || false,
      },
    });

    return {
      success: true,
      message: 'Parent/Guardian added successfully',
      parent,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getParents = async (studentId: string) => {
  try {
    const parents = await prisma.studentParent.findMany({
      where: { studentId },
      orderBy: { relationship: 'asc' },
    });

    return { success: true, parents };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const updateParent = async (
  parentId: string,
  data: UpdateParentRequest
) => {
  try {
    const parent = await prisma.studentParent.update({
      where: { id: parentId },
      data,
    });

    return { success: true, message: 'Parent updated successfully', parent };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const deleteParent = async (parentId: string) => {
  try {
    await prisma.studentParent.delete({
      where: { id: parentId },
    });

    return { success: true, message: 'Parent deleted successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// ACADEMIC RECORDS MANAGEMENT
// ============================================================================

export const addAcademicRecord = async (
  studentId: string,
  data: CreateAcademicRecordRequest
) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    const record = await prisma.studentAcademicRecord.create({
      data: {
        studentId,
        semester: data.semester,
        academicYear: data.academicYear,
        semesterGpa: data.semesterGpa,
        semesterCredits: data.semesterCredits,
        creditsEarned: data.creditsEarned,
        attemptedCredits: data.attemptedCredits,
        totalCreditsEarned: student.creditsEarned + data.creditsEarned,
        totalAttemptedCredits:
          (student.creditsEarned || 0) + data.attemptedCredits,
        cumulativeGpa: data.semesterGpa,
        academicStanding: data.academicStanding || 'GOOD',
        notes: data.notes,
      },
    });

    // Update student's overall GPA and credits
    await prisma.student.update({
      where: { id: studentId },
      data: {
        creditsEarned: student.creditsEarned + data.creditsEarned,
        cumulativeGpa: data.semesterGpa,
      },
    });

    return {
      success: true,
      message: 'Academic record added successfully',
      record,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getAcademicRecords = async (studentId: string) => {
  try {
    const records = await prisma.studentAcademicRecord.findMany({
      where: { studentId },
      orderBy: { academicYear: 'desc' },
    });

    return { success: true, records };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getAcademicRecordBySemester = async (
  studentId: string,
  semester: string,
  academicYear: string
) => {
  try {
    const record = await prisma.studentAcademicRecord.findFirst({
      where: { studentId, semester, academicYear },
    });

    if (!record) {
      return {
        success: false,
        message: 'Academic record not found for this semester',
      };
    }

    return { success: true, record };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// FEE MANAGEMENT
// ============================================================================

export const addFeeStructure = async (
  studentId: string,
  data: CreateFeeRequest
) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    const fee = await prisma.studentFee.create({
      data: {
        studentId,
        semester: data.semester,
        academicYear: data.academicYear,
        feeCategory: data.feeCategory,
        totalFeeAmount: data.totalFeeAmount,
        dueDate: new Date(data.dueDate),
        balance: data.totalFeeAmount,
        installments: data.installments || 1,
      },
    });

    return {
      success: true,
      message: 'Fee structure added successfully',
      fee,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const recordFeePayment = async (
  feeId: string,
  data: RecordFeePaymentRequest
) => {
  try {
    const fee = await prisma.studentFee.findUnique({
      where: { id: feeId },
      include: { payments: true },
    });

    if (!fee) {
      return { success: false, message: 'Fee record not found' };
    }

    // Create payment record
    const payment = await prisma.studentFeePayment.create({
      data: {
        studentFeeId: feeId,
        paymentAmount: data.paidAmount,
        paymentDate: new Date(data.paymentDate),
        transactionId: data.transactionId,
        remarks: data.remarks,
      },
    });

    // Update fee record
    const newPaidAmount = parseFloat(fee.paidAmount.toString()) + data.paidAmount;
    const newBalance = parseFloat(fee.totalFeeAmount.toString()) - newPaidAmount;
    let paymentStatus = 'PARTIAL_PAID';

    if (newBalance <= 0) {
      paymentStatus = 'PAID';
    } else if (newPaidAmount === 0) {
      paymentStatus = 'PENDING';
    }

    const updatedFee = await prisma.studentFee.update({
      where: { id: feeId },
      data: {
        paidAmount: newPaidAmount,
        balance: Math.max(0, newBalance),
        paymentStatus,
        lastPaymentDate: new Date(data.paymentDate),
        lastPaymentAmount: data.paidAmount,
        installmentsPaid: { increment: 1 },
      },
    });

    return {
      success: true,
      message: 'Payment recorded successfully',
      payment,
      fee: updatedFee,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getStudentFees = async (studentId: string) => {
  try {
    const fees = await prisma.studentFee.findMany({
      where: { studentId },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    return { success: true, fees };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getFeeSummary = async (
  studentId: string,
  semester?: string,
  academicYear?: string
): Promise<StudentFeeSummary | any> => {
  try {
    const whereClause: any = { studentId };
    if (semester) whereClause.semester = semester;
    if (academicYear) whereClause.academicYear = academicYear;

    const fees = await prisma.studentFee.findMany({
      where: whereClause,
    });

    const totalFeesDue = fees.reduce(
      (sum, f) => sum + parseFloat(f.totalFeeAmount.toString()),
      0
    );
    const totalFeesPaid = fees.reduce(
      (sum, f) => sum + parseFloat(f.paidAmount.toString()),
      0
    );
    const pendingFees = totalFeesDue - totalFeesPaid;

    return {
      success: true,
      summary: {
        studentId,
        semester: semester || 'ALL',
        academicYear: academicYear || 'ALL',
        totalFeesDue,
        totalFeesPaid,
        remainingBalance: Math.max(0, pendingFees),
        categories: fees,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// TUTOR WARD MANAGEMENT
// ============================================================================

export const assignTutorWard = async (
  studentId: string,
  data: AssignTutorWardRequest
) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    const tutor = await prisma.faculty.findUnique({
      where: { id: data.tutorId },
    });

    if (!tutor) {
      return { success: false, message: 'Tutor not found' };
    }

    const tutorWard = await prisma.studentTutorWard.create({
      data: {
        studentId,
        tutorId: data.tutorId,
        startDate: new Date(data.startDate),
        assignmentReason: data.assignmentReason,
        mentorshipPlan: data.mentorshipPlan,
        frequencyOfMeeting: data.frequencyOfMeeting,
      },
    });

    return {
      success: true,
      message: 'Tutor assigned successfully',
      tutorWard,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getTutorWard = async (studentId: string) => {
  try {
    const tutorWard = await prisma.studentTutorWard.findUnique({
      where: { studentId },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        meetingRecords: {
          orderBy: { meetingDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!tutorWard) {
      return { success: false, message: 'No tutor assigned' };
    }

    return { success: true, tutorWard };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const updateTutorWard = async (
  tutorWardId: string,
  data: UpdateTutorWardRequest
) => {
  try {
    const tutorWard = await prisma.studentTutorWard.update({
      where: { id: tutorWardId },
      data,
    });

    return {
      success: true,
      message: 'Tutor ward updated successfully',
      tutorWard,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const recordMeetingWithTutor = async (
  tutorWardId: string,
  meetingData: any
) => {
  try {
    const meeting = await prisma.studentMeetingRecord.create({
      data: {
        tutorWardId,
        meetingDate: new Date(meetingData.meetingDate),
        duration: meetingData.duration,
        topics: meetingData.topics || [],
        notes: meetingData.notes,
        studentProgress: meetingData.studentProgress,
        discussionPoints: meetingData.discussionPoints,
        nextActionItems: meetingData.nextActionItems,
        nextMeetingScheduled: meetingData.nextMeetingScheduled
          ? new Date(meetingData.nextMeetingScheduled)
          : null,
      },
    });

    // Update next meeting date in tutorWard
    if (meetingData.nextMeetingScheduled) {
      await prisma.studentTutorWard.update({
        where: { id: tutorWardId },
        data: {
          lastMeetingDate: new Date(meetingData.meetingDate),
          nextMeetingDate: new Date(meetingData.nextMeetingScheduled),
        },
      });
    }

    return {
      success: true,
      message: 'Meeting recorded successfully',
      meeting,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// STUDENT DASHBOARD
// ============================================================================

export const getStudentDashboard = async (
  studentId: string
): Promise<any> => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
            phoneNumber: true,
            mobileNumber: true,
          },
        },
        primaryAdvisor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        parents: true,
        academicRecords: { orderBy: { academicYear: 'desc' } },
        fees: { orderBy: { dueDate: 'desc' } },
        tutorWards: {
          include: {
            tutor: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    const profile: StudentProfile = {
      id: student.id,
      userId: student.userId,
      studentId: student.studentId,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      dateOfBirth: student.user.dateOfBirth || new Date(),
      degreeProgram: student.degreeProgram,
      majorId: student.majorId,
      minorId: student.minorId || undefined,
      concentrationId: student.concentrationId || undefined,
      enrollmentStatus: student.enrollmentStatus,
      enrollmentDate: student.enrollmentDate,
      currentGpa: student.currentGpa
        ? parseFloat(student.currentGpa.toString())
        : undefined,
      cumulativeGpa: student.cumulativeGpa
        ? parseFloat(student.cumulativeGpa.toString())
        : undefined,
      academicStanding: student.academicStanding,
      creditsEarned: student.creditsEarned,
      hasFinancialHold: student.hasFinancialHold,
      primaryAdvisorId: student.primaryAdvisorId || undefined,
      primaryAdvisorName: student.primaryAdvisor
        ? `${student.primaryAdvisor.user.firstName} ${student.primaryAdvisor.user.lastName}`
        : undefined,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };

    const totalFeesDue = student.fees.reduce(
      (sum, f) => sum + parseFloat(f.totalFeeAmount.toString()),
      0
    );
    const totalFeesPaid = student.fees.reduce(
      (sum, f) => sum + parseFloat(f.paidAmount.toString()),
      0
    );

    return {
      success: true,
      dashboard: {
        profile,
        parents: student.parents,
        academicRecords: student.academicRecords,
        fees: student.fees,
        tutorWard: student.tutorWards[0] || null,
        stats: {
          totalParents: student.parents.length,
          currentGpa: student.currentGpa
            ? parseFloat(student.currentGpa.toString())
            : 0,
          creditsEarned: student.creditsEarned,
          creditsRequired: student.creditsRequired || 0,
          totalFeesDue,
          totalFeesPaid,
          pendingFees: totalFeesDue - totalFeesPaid,
          academicStanding: student.academicStanding,
          tutorAssigned: student.tutorWards.length > 0,
        },
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
