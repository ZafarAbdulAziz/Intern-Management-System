import { PageHeader, Card } from '../../components/common/index'

export default function ProfilePictureSettings() {
  return (
    <div>
      <PageHeader title="Change Profile Picture" subtitle="Upload a new profile picture for your account." />
      <Card>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          This page is a placeholder for changing your profile picture.
          Implement the upload flow and image preview here when ready.
        </p>
      </Card>
    </div>
  )
}
