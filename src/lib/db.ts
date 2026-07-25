import { prisma } from './prisma'

export const db = {
  user: {
    findUnique: (args: any) => prisma.user.findUnique(args),
    findMany: (args?: any) => prisma.user.findMany(args),
    create: (args: any) => prisma.user.create(args),
    update: (args: any) => prisma.user.update(args),
  },
  class: {
    findUnique: (args: any) => prisma.class.findUnique(args),
    findMany: (args?: any) => prisma.class.findMany(args),
    create: (args: any) => prisma.class.create(args),
  },
  enrollment: {
    findMany: (args?: any) => prisma.enrollment.findMany(args),
    create: (args: any) => prisma.enrollment.create(args),
  },
  assignment: {
    findUnique: (args: any) => prisma.assignment.findUnique(args),
    findMany: (args?: any) => prisma.assignment.findMany(args),
    create: (args: any) => prisma.assignment.create(args),
  },
  group: {
    create: (args: any) => prisma.group.create(args),
    findMany: (args?: any) => prisma.group.findMany(args),
  },
  groupMember: {
    createMany: (args: any) => prisma.groupMember.createMany(args),
  },
  file: {
    create: (args: any) => prisma.file.create(args),
    findMany: (args?: any) => prisma.file.findMany(args),
  },
  quiz: {
    create: (args: any) => prisma.quiz.create(args),
    findUnique: (args: any) => prisma.quiz.findUnique(args),
    findMany: (args?: any) => prisma.quiz.findMany(args),
  },
  question: {
    createMany: (args: any) => prisma.question.createMany(args),
    findMany: (args?: any) => prisma.question.findMany(args),
  },
  quizAttempt: {
    create: (args: any) => prisma.quizAttempt.create(args),
  },
  submission: {
    findUnique: (args: any) => prisma.submission.findUnique(args),
    findMany: (args?: any) => prisma.submission.findMany(args),
    create: (args: any) => prisma.submission.create(args),
    update: (args: any) => prisma.submission.update(args),
  },
  passwordResetToken: {
    findUnique: (args: any) => prisma.passwordResetToken.findUnique(args),
    create: (args: any) => prisma.passwordResetToken.create(args),
    update: (args: any) => prisma.passwordResetToken.update(args),
  },
}
