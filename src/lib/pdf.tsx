import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 15,
    color: '#666',
  },
  groupContainer: {
    marginBottom: 15,
    padding: 10,
    border: '1px solid #ccc',
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  memberRow: {
    fontSize: 10,
    paddingLeft: 10,
    paddingVertical: 2,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    fontSize: 10,
    borderBottom: '1px solid #eee',
  },
  colGroup: { width: '20%' },
  colMember: { width: '30%' },
  colEmail: { width: '50%' },
})

interface GroupData {
  name: string
  members: { name: string; email: string }[]
}

interface ClassInfo {
  name: string
  assignmentTitle: string
}

export function GroupPDF({ groups, classInfo }: { groups: GroupData[]; classInfo: ClassInfo }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{classInfo.name}</Text>
        <Text style={styles.subtitle}>Assignment: {classInfo.assignmentTitle}</Text>
        <Text style={styles.subtitle}>Date: {new Date().toLocaleDateString()}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colGroup}>Group</Text>
            <Text style={styles.colMember}>Member</Text>
            <Text style={styles.colEmail}>Email</Text>
          </View>
          {groups.map((group, gi) =>
            group.members.map((member, mi) => (
              <View style={styles.tableRow} key={`${gi}-${mi}`}>
                {mi === 0 && <Text style={styles.colGroup}>{group.name}</Text>}
                {mi !== 0 && <Text style={styles.colGroup} />}
                <Text style={styles.colMember}>{member.name}</Text>
                <Text style={styles.colEmail}>{member.email}</Text>
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  )
}
