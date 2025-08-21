import { useState } from "react";
import RoleSelector from "@/components/RoleSelector";
import SuperAdminDashboard from "@/components/SuperAdminDashboard";
import PartnerDashboard from "@/components/PartnerDashboard";
import ClientDashboard from "@/components/ClientDashboard";

type Role = 'super-admin' | 'partner' | 'client' | null;

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  if (selectedRole === 'super-admin') {
    return <SuperAdminDashboard onBack={handleBack} />;
  }

  if (selectedRole === 'partner') {
    return <PartnerDashboard onBack={handleBack} />;
  }

  if (selectedRole === 'client') {
    return <ClientDashboard onBack={handleBack} />;
  }

  return <RoleSelector onRoleSelect={handleRoleSelect} />;
};

export default Index;
