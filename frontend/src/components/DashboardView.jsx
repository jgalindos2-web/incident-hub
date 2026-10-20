import AdminDashboardView from './AdminDashboardView';
import TechnicianDashboardView from './TechnicianDashboardView';

export default function DashboardView({
  currentUser,
  stats,
  onOpenIncidents,
  onOpenMyIncidents,
}) {
  if (currentUser?.role === 'ADMIN') {
    return (
      <AdminDashboardView
        stats={stats}
        onOpenIncidents={onOpenIncidents}
      />
    );
  }

  return (
    <TechnicianDashboardView
      currentUser={currentUser}
      stats={stats}
      onOpenMyIncidents={onOpenMyIncidents || onOpenIncidents}
      onOpenAllIncidents={onOpenIncidents}
    />
  );
}
