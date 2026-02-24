import { useProjects } from '../../api/hooks'

export default function ProjectPanel() {
  const { data: projects } = useProjects()
  return (
    <div className="project-panel">
      <h2>Project Panel</h2>
      {/* Add your project panel content here */}
    </div>
  )
}
