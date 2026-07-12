import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

interface StoredData {
  users: any[]
  classes: any[]
  enrollments: any[]
  assignments: any[]
  groups: any[]
  groupMembers: any[]
  files: any[]
  quizzes: any[]
  questions: any[]
  quizAttempts: any[]
}

function load(): StoredData {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    }
  } catch {}
  return { users: [], classes: [], enrollments: [], assignments: [], groups: [], groupMembers: [], files: [], quizzes: [], questions: [], quizAttempts: [] }
}

function save(data: StoredData) {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

function uid() {
  return crypto.randomBytes(12).toString('hex')
}

function ts() {
  return new Date().toISOString()
}

function findById(col: any[], id: string) {
  return col.find((item: any) => item.id === id) || null
}

function where(col: any[], filters: Record<string, any>) {
  return col.filter((item: any) =>
    Object.entries(filters).every(([key, value]) => item[key] === value)
  )
}

function applyInclude(item: any, include: any, data: StoredData): any {
  if (!include || !item) return item
  const result = { ...item }
  for (const [key, config] of Object.entries(include)) {
    if (key === '_count' && (config as any)?.select) {
      result._count = {}
      for (const [rel, _] of Object.entries((config as any).select)) {
        const pluralMap: Record<string, string> = {
          enrollments: 'enrollments', assignments: 'assignments', files: 'files', quizzes: 'quizzes',
          groups: 'groups', questions: 'questions',
        }
        const colName = pluralMap[rel]
        if (colName && (data as any)[colName]) {
          result._count[rel] = (data as any)[colName].filter((x: any) => x.classId === item.id || x.assignmentId === item.id || x.quizId === item.id || x.groupId === item.id).length
        }
      }
    } else if (key === 'enrollments' || key === 'members') {
      const relConfig = config as any
      let items: any[]
      if (key === 'enrollments') {
        items = where(data.enrollments, { classId: item.id })
      } else {
        items = where(data.groupMembers, { groupId: item.id })
      }
      if (relConfig?.include?.user) {
        const userSelect = (relConfig.include.user as any)?.select
        items = items.map((x: any) => ({
          ...x,
          user: userSelect
            ? Object.fromEntries(Object.entries(userSelect).map(([k]) => [k, (findById(data.users, x.userId) || {})[k]]))
            : findById(data.users, x.userId),
        }))
      }
      result[key] = items
    } else if (key === 'user' || key === 'rep') {
      const config_ = config as any
      const user = findById(data.users, item[key === 'rep' ? 'repId' : 'userId'])
      if (config_?.select) {
        result[key] = Object.fromEntries(Object.entries(config_.select).map(([k]) => [k, (user || {})[k]]))
      } else {
        result[key] = user
      }
    } else if (key === 'groups') {
      let items = where(data.groups, { assignmentId: item.id })
      const gConfig = config as any
      if (gConfig?.include?.members) {
        items = items.map((g: any) => ({
          ...g,
          members: where(data.groupMembers, { groupId: g.id }).map((gm: any) => ({
            ...gm,
            user: findById(data.users, gm.userId),
          })),
        }))
      }
      result[key] = items
    } else if (key === 'files') {
      result[key] = where(data.files, { classId: item.id })
    } else if (key === 'quizzes') {
      result[key] = where(data.quizzes, { classId: item.id })
    } else if (key === 'assignments') {
      let items = where(data.assignments, { classId: item.id })
      const aConfig = config as any
      if (aConfig?.include?._count?.select) {
        items = items.map((a: any) => {
          const counter: any = {}
          for (const [rel, _] of Object.entries(aConfig.include._count.select)) {
            if (rel === 'groups') counter.groups = where(data.groups, { assignmentId: a.id }).length
          }
          return { ...a, _count: counter }
        })
      }
      result[key] = items
    } else if (key === 'questions') {
      result[key] = where(data.questions, { quizId: item.id })
    } else if (key === 'class') {
      result[key] = findById(data.classes, item.classId)
      const cConfig = config as any
      if (cConfig?.include?.enrollments) {
        const eConfig = cConfig.include.enrollments as any
        let enrollments = where(data.enrollments, { classId: result[key].id })
        if (eConfig?.where?.userId) {
          enrollments = enrollments.filter((e: any) => e.userId === eConfig.where.userId)
        }
        result[key].enrollments = enrollments
      }
    } else if (key === 'sourceFile') {
      result[key] = findById(data.files, item.sourceFileId)
    } else if (key === 'attempts') {
      result[key] = where(data.quizAttempts, { quizId: item.id })
    }
  }
  return result
}

// --- Public API ---
export const db = {
  user: {
    findUnique: ({ where: { id, email }, include }: { where: { id?: string; email?: string }; include?: any }) => {
      const data = load()
      let user = id ? findById(data.users, id) : email ? data.users.find(u => u.email === email) || null : null
      return include ? applyInclude(user, include, data) : user
    },
    findMany: (opts: any = {}) => {
      const data = load()
      let results = opts.where ? where(data.users, opts.where) : [...data.users]
      return results
    },
    create: ({ data: input }: { data: any }) => {
      const d = load()
      const user = { id: uid(), ...input, emailVerified: null, image: null, createdAt: ts(), updatedAt: ts() }
      d.users.push(user)
      save(d)
      return user
    },
  },
  class: {
    findUnique: ({ where: { id, joinCode }, include }: { where: { id?: string; joinCode?: string }; include?: any }) => {
      const data = load()
      let cls = id ? findById(data.classes, id) : joinCode ? data.classes.find(c => c.joinCode === joinCode) || null : null
      return include ? applyInclude(cls, include, data) : cls
    },
    findMany: (opts: any = {}) => {
      const data = load()
      let results = opts.where ? where(data.classes, opts.where) : [...data.classes]
      if (opts.orderBy?.createdAt === 'desc') results.reverse()
      results = results.map(c => opts.include ? applyInclude(c, opts.include, data) : c)
      return results
    },
    create: ({ data: input }: { data: any }) => {
      const d = load()
      const cls = { id: uid(), ...input, createdAt: ts(), updatedAt: ts() }
      d.classes.push(cls)
      save(d)
      return cls
    },
  },
  enrollment: {
    findMany: (opts: any = {}) => {
      const data = load()
      let results = opts.where ? where(data.enrollments, opts.where) : [...data.enrollments]
      if (opts.include?.user) {
        results = results.map((e: any) => ({ ...e, user: findById(data.users, e.userId) }))
      }
      return results
    },
    create: ({ data: input }: { data: any }) => {
      const d = load()
      const e = { id: uid(), ...input, createdAt: ts() }
      d.enrollments.push(e)
      save(d)
      return e
    },
  },
  assignment: {
    findUnique: ({ where: { id }, include }: { where: { id: string }; include?: any }) => {
      const data = load()
      return include ? applyInclude(findById(data.assignments, id), include, data) : findById(data.assignments, id)
    },
    findMany: (opts: any = {}) => {
      const data = load()
      let results = opts.where ? where(data.assignments, opts.where) : [...data.assignments]
      if (opts.orderBy?.createdAt === 'desc') results.reverse()
      results = results.map(a => opts.include ? applyInclude(a, opts.include, data) : a)
      return results
    },
    create: ({ data: input }: { data: any }) => {
      const d = load()
      const a = { id: uid(), ...input, createdAt: ts(), updatedAt: ts() }
      d.assignments.push(a)
      save(d)
      return a
    },
  },
  group: {
    create: ({ data: input }: { data: any }) => {
      const d = load()
      const g = { id: uid(), ...input, createdAt: ts() }
      d.groups.push(g)
      save(d)
      return g
    },
    findMany: (opts: any = {}) => {
      const data = load()
      let results = opts.where ? where(data.groups, opts.where) : [...data.groups]
      if (opts.orderBy?.name === 'asc') results.sort((a: any, b: any) => a.name.localeCompare(b.name))
      results = results.map(g => opts.include ? applyInclude(g, opts.include, data) : g)
      return results
    },
  },
  groupMember: {
    createMany: ({ data: items }: { data: any[] }) => {
      const d = load()
      for (const item of items) {
        d.groupMembers.push({ id: uid(), ...item, createdAt: ts() })
      }
      save(d)
    },
  },
  file: {
    create: ({ data: input }: { data: any }) => {
      const d = load()
      const f = { id: uid(), ...input, createdAt: ts(), updatedAt: ts() }
      d.files.push(f)
      save(d)
      return f
    },
    findMany: (opts: any = {}) => {
      const data = load()
      let results = opts.where ? where(data.files, opts.where) : [...data.files]
      if (opts.orderBy?.createdAt === 'desc') results.reverse()
      return results
    },
  },
  quiz: {
    create: ({ data: input }: { data: any }) => {
      const d = load()
      const q = { id: uid(), ...input, createdAt: ts(), updatedAt: ts() }
      d.quizzes.push(q)
      save(d)
      return q
    },
    findUnique: ({ where: { id }, include }: { where: { id: string }; include?: any }) => {
      const data = load()
      return include ? applyInclude(findById(data.quizzes, id), include, data) : findById(data.quizzes, id)
    },
    findMany: (opts: any = {}) => {
      const data = load()
      let results = opts.where ? where(data.quizzes, opts.where) : [...data.quizzes]
      if (opts.orderBy?.createdAt === 'desc') results.reverse()
      return results
    },
  },
  question: {
    createMany: ({ data: items }: { data: any[] }) => {
      const d = load()
      for (const item of items) {
        d.questions.push({ id: uid(), ...item, createdAt: ts() })
      }
      save(d)
    },
    findMany: (opts: { where: Record<string, any> }) => {
      const data = load()
      return where(data.questions, opts.where)
    },
  },
  quizAttempt: {
    create: ({ data: input }: { data: any }) => {
      const d = load()
      const a = { id: uid(), ...input, createdAt: ts() }
      d.quizAttempts.push(a)
      save(d)
      return a
    },
  },
}
