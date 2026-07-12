export function assignGroups(
  studentIds: string[],
  groupCount: number,
  groupSize: number
): string[][] {
  const shuffled = [...studentIds].sort(() => Math.random() - 0.5)
  const groups: string[][] = Array.from({ length: groupCount }, () => [])

  let studentIndex = 0
  for (const id of shuffled) {
    const groupIndex = studentIndex % groupCount
    if (groups[groupIndex].length < groupSize) {
      groups[groupIndex].push(id)
      studentIndex++
    } else {
      for (let g = 0; g < groupCount; g++) {
        if (groups[g].length < groupSize) {
          groups[g].push(id)
          studentIndex++
          break
        }
      }
    }
  }

  return groups
}
