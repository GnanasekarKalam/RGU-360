// src/services/faculty-master.service.ts
// Faculty Master Module Service

import { PrismaClient } from '@prisma/client';
import {
  CreateQualificationRequest,
  CreatePublicationRequest,
  CreateFDPRequest,
  CreateSeminarRequest,
  CreatePhdRequest,
  UpdatePhdRequest,
  CreateSkillRequest,
  CreateEvidenceRequest,
  FacultyDashboardResponse,
} from '../types/faculty-master.types';

const prisma = new PrismaClient();

// ============================================================================
// FACULTY PROFILE
// ============================================================================

export const getFacultyProfile = async (facultyId: string) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
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
        department: {
          select: { id: true, name: true },
        },
      },
    });

    if (!faculty) {
      return { success: false, message: 'Faculty not found' };
    }

    return {
      success: true,
      faculty: {
        ...faculty,
        firstName: faculty.user.firstName,
        lastName: faculty.user.lastName,
        email: faculty.user.email,
        departmentName: faculty.department.name,
      },
    };
  } catch (error: any) {
    console.error('Get faculty profile error:', error);
    return { success: false, message: 'Failed to get faculty profile' };
  }
};

export const updateFacultyProfile = async (facultyId: string, data: any) => {
  try {
    const updated = await prisma.faculty.update({
      where: { id: facultyId },
      data,
      include: { user: true, department: true },
    });

    return {
      success: true,
      message: 'Faculty profile updated successfully',
      faculty: updated,
    };
  } catch (error: any) {
    console.error('Update faculty profile error:', error);
    return { success: false, message: 'Failed to update faculty profile' };
  }
};

// ============================================================================
// QUALIFICATIONS
// ============================================================================

export const addQualification = async (
  facultyId: string,
  data: CreateQualificationRequest
) => {
  try {
    const qualification = await prisma.facultyQualification.create({
      data: {
        facultyId,
        ...data,
      },
    });

    return {
      success: true,
      message: 'Qualification added successfully',
      qualification,
    };
  } catch (error: any) {
    console.error('Add qualification error:', error);
    return { success: false, message: 'Failed to add qualification' };
  }
};

export const getQualifications = async (facultyId: string) => {
  try {
    const qualifications = await prisma.facultyQualification.findMany({
      where: { facultyId },
      orderBy: { yearOfPassing: 'desc' },
    });

    return { success: true, qualifications };
  } catch (error: any) {
    console.error('Get qualifications error:', error);
    return { success: false, message: 'Failed to get qualifications' };
  }
};

export const deleteQualification = async (qualificationId: string) => {
  try {
    await prisma.facultyQualification.delete({
      where: { id: qualificationId },
    });

    return { success: true, message: 'Qualification deleted successfully' };
  } catch (error: any) {
    console.error('Delete qualification error:', error);
    return { success: false, message: 'Failed to delete qualification' };
  }
};

// ============================================================================
// PUBLICATIONS
// ============================================================================

export const addPublication = async (
  facultyId: string,
  data: CreatePublicationRequest
) => {
  try {
    const publication = await prisma.facultyPublication.create({
      data: {
        facultyId,
        ...data,
      },
    });

    return {
      success: true,
      message: 'Publication added successfully',
      publication,
    };
  } catch (error: any) {
    console.error('Add publication error:', error);
    return { success: false, message: 'Failed to add publication' };
  }
};

export const getPublications = async (facultyId: string, limit = 100) => {
  try {
    const publications = await prisma.facultyPublication.findMany({
      where: { facultyId },
      orderBy: { publicationYear: 'desc' },
      take: limit,
    });

    return { success: true, publications };
  } catch (error: any) {
    console.error('Get publications error:', error);
    return { success: false, message: 'Failed to get publications' };
  }
};

export const deletePublication = async (publicationId: string) => {
  try {
    await prisma.facultyPublication.delete({
      where: { id: publicationId },
    });

    return { success: true, message: 'Publication deleted successfully' };
  } catch (error: any) {
    console.error('Delete publication error:', error);
    return { success: false, message: 'Failed to delete publication' };
  }
};

// ============================================================================
// FDP PROGRAMS
// ============================================================================

export const addFDP = async (facultyId: string, data: CreateFDPRequest) => {
  try {
    const fdp = await prisma.facultyFDP.create({
      data: {
        facultyId,
        duration: Math.ceil(
          (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        ...data,
      },
    });

    return { success: true, message: 'FDP added successfully', fdp };
  } catch (error: any) {
    console.error('Add FDP error:', error);
    return { success: false, message: 'Failed to add FDP' };
  }
};

export const getFDPPrograms = async (facultyId: string) => {
  try {
    const programs = await prisma.facultyFDP.findMany({
      where: { facultyId },
      orderBy: { endDate: 'desc' },
    });

    return { success: true, programs };
  } catch (error: any) {
    console.error('Get FDP programs error:', error);
    return { success: false, message: 'Failed to get FDP programs' };
  }
};

export const deleteFDP = async (fdpId: string) => {
  try {
    await prisma.facultyFDP.delete({
      where: { id: fdpId },
    });

    return { success: true, message: 'FDP deleted successfully' };
  } catch (error: any) {
    console.error('Delete FDP error:', error);
    return { success: false, message: 'Failed to delete FDP' };
  }
};

// ============================================================================
// SEMINARS
// ============================================================================

export const addSeminar = async (
  facultyId: string,
  data: CreateSeminarRequest
) => {
  try {
    const seminar = await prisma.facultySeminar.create({
      data: {
        facultyId,
        ...data,
      },
    });

    return { success: true, message: 'Seminar added successfully', seminar };
  } catch (error: any) {
    console.error('Add seminar error:', error);
    return { success: false, message: 'Failed to add seminar' };
  }
};

export const getSeminars = async (facultyId: string) => {
  try {
    const seminars = await prisma.facultySeminar.findMany({
      where: { facultyId },
      orderBy: { endDate: 'desc' },
    });

    return { success: true, seminars };
  } catch (error: any) {
    console.error('Get seminars error:', error);
    return { success: false, message: 'Failed to get seminars' };
  }
};

export const deleteSeminar = async (seminarId: string) => {
  try {
    await prisma.facultySeminar.delete({
      where: { id: seminarId },
    });

    return { success: true, message: 'Seminar deleted successfully' };
  } catch (error: any) {
    console.error('Delete seminar error:', error);
    return { success: false, message: 'Failed to delete seminar' };
  }
};

// ============================================================================
// PhD TRACKING
// ============================================================================

export const addPhdCandidate = async (
  facultyId: string,
  data: CreatePhdRequest
) => {
  try {
    const phd = await prisma.facultyPhd.create({
      data: {
        facultyId,
        ...data,
      },
    });

    return { success: true, message: 'PhD candidate added successfully', phd };
  } catch (error: any) {
    console.error('Add PhD candidate error:', error);
    return { success: false, message: 'Failed to add PhD candidate' };
  }
};

export const getPhdCandidates = async (facultyId: string) => {
  try {
    const candidates = await prisma.facultyPhd.findMany({
      where: { facultyId },
      orderBy: { expectedCompletionDate: 'asc' },
    });

    return { success: true, candidates };
  } catch (error: any) {
    console.error('Get PhD candidates error:', error);
    return { success: false, message: 'Failed to get PhD candidates' };
  }
};

export const updatePhdProgress = async (
  phdId: string,
  data: UpdatePhdRequest
) => {
  try {
    const updated = await prisma.facultyPhd.update({
      where: { id: phdId },
      data,
    });

    return {
      success: true,
      message: 'PhD progress updated successfully',
      phd: updated,
    };
  } catch (error: any) {
    console.error('Update PhD progress error:', error);
    return { success: false, message: 'Failed to update PhD progress' };
  }
};

export const deletePhdCandidate = async (phdId: string) => {
  try {
    await prisma.facultyPhd.delete({
      where: { id: phdId },
    });

    return { success: true, message: 'PhD candidate deleted successfully' };
  } catch (error: any) {
    console.error('Delete PhD candidate error:', error);
    return { success: false, message: 'Failed to delete PhD candidate' };
  }
};

// ============================================================================
// SKILLS
// ============================================================================

export const addSkill = async (facultyId: string, data: CreateSkillRequest) => {
  try {
    const skill = await prisma.facultySkill.create({
      data: {
        facultyId,
        lastUpdated: new Date(),
        ...data,
      },
    });

    return { success: true, message: 'Skill added successfully', skill };
  } catch (error: any) {
    console.error('Add skill error:', error);
    return { success: false, message: 'Failed to add skill' };
  }
};

export const getSkills = async (facultyId: string) => {
  try {
    const skills = await prisma.facultySkill.findMany({
      where: { facultyId },
      orderBy: { proficiencyLevel: 'desc' },
    });

    return { success: true, skills };
  } catch (error: any) {
    console.error('Get skills error:', error);
    return { success: false, message: 'Failed to get skills' };
  }
};

export const deleteSkill = async (skillId: string) => {
  try {
    await prisma.facultySkill.delete({
      where: { id: skillId },
    });

    return { success: true, message: 'Skill deleted successfully' };
  } catch (error: any) {
    console.error('Delete skill error:', error);
    return { success: false, message: 'Failed to delete skill' };
  }
};

// ============================================================================
// EVIDENCE
// ============================================================================

export const addEvidence = async (
  facultyId: string,
  data: CreateEvidenceRequest
) => {
  try {
    const evidence = await prisma.facultyEvidence.create({
      data: {
        facultyId,
        status: 'PENDING',
        ...data,
      },
    });

    return { success: true, message: 'Evidence added successfully', evidence };
  } catch (error: any) {
    console.error('Add evidence error:', error);
    return { success: false, message: 'Failed to add evidence' };
  }
};

export const getEvidence = async (facultyId: string) => {
  try {
    const evidence = await prisma.facultyEvidence.findMany({
      where: { facultyId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, evidence };
  } catch (error: any) {
    console.error('Get evidence error:', error);
    return { success: false, message: 'Failed to get evidence' };
  }
};

export const verifyEvidence = async (evidenceId: string, verifiedBy: string) => {
  try {
    const updated = await prisma.facultyEvidence.update({
      where: { id: evidenceId },
      data: {
        status: 'VERIFIED',
        verifiedBy,
        verifiedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Evidence verified successfully',
      evidence: updated,
    };
  } catch (error: any) {
    console.error('Verify evidence error:', error);
    return { success: false, message: 'Failed to verify evidence' };
  }
};

export const deleteEvidence = async (evidenceId: string) => {
  try {
    await prisma.facultyEvidence.delete({
      where: { id: evidenceId },
    });

    return { success: true, message: 'Evidence deleted successfully' };
  } catch (error: any) {
    console.error('Delete evidence error:', error);
    return { success: false, message: 'Failed to delete evidence' };
  }
};

// ============================================================================
// FACULTY DASHBOARD
// ============================================================================

export const getFacultyDashboard = async (facultyId: string): Promise<FacultyDashboardResponse | any> => {
  try {
    const profile = await getFacultyProfile(facultyId);
    const { qualifications } = await getQualifications(facultyId);
    const { publications } = await getPublications(facultyId, 100);
    const { programs: fdpPrograms } = await getFDPPrograms(facultyId);
    const { seminars } = await getSeminars(facultyId);
    const { candidates: phdCandidates } = await getPhdCandidates(facultyId);
    const { skills } = await getSkills(facultyId);
    const { evidence } = await getEvidence(facultyId);

    const completedPhds = phdCandidates?.filter((p: any) => p.status === 'COMPLETED').length || 0;

    return {
      success: true,
      dashboard: {
        profile: profile.faculty,
        qualifications: qualifications || [],
        publications: publications || [],
        fdpPrograms: fdpPrograms || [],
        seminars: seminars || [],
        phdCandidates: phdCandidates || [],
        skills: skills || [],
        evidence: evidence || [],
        stats: {
          totalPublications: publications?.length || 0,
          totalFDPPrograms: fdpPrograms?.length || 0,
          totalSeminars: seminars?.length || 0,
          totalPhdCandidates: phdCandidates?.length || 0,
          completedPhds,
          totalSkills: skills?.length || 0,
          totalEvidenceItems: evidence?.length || 0,
        },
      },
    };
  } catch (error: any) {
    console.error('Get faculty dashboard error:', error);
    return { success: false, message: 'Failed to get faculty dashboard' };
  }
};
