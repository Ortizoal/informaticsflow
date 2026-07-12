import { OfficeParser } from 'officeparser'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export async function extractTextFromFile(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = fileName.toLowerCase().split('.').pop()

  if (ext === 'pdf' || ext === 'pptx' || ext === 'ppt') {
    const tmpPath = join(tmpdir(), `classflow-${Date.now()}`)
    try {
      await writeFile(tmpPath, fileBuffer)
      const result = await OfficeParser.parseOffice(tmpPath)
      const text = result.content?.map((n: any) => n.text || '').join('\n') || ''
      return text
    } finally {
      try { await unlink(tmpPath) } catch {}
    }
  }

  throw new Error(`Unsupported file type: ${ext}`)
}
