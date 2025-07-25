"use client";

import { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Badge } from "primereact/badge";
import {
  Users,
  Eye,
  MagnifyingGlass,
  Pencil,
  Trash,
  Shield,
  UserPlus
} from "@phosphor-icons/react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading users data
    const loadUsers = async () => {
      setLoading(true);
      setTimeout(() => {
        setUsers([
          {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            role: "user",
            status: "active",
            createdAt: "2024-01-15",
            lastLogin: "2024-01-20"
          },
          {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
            role: "admin",
            status: "active",
            createdAt: "2024-01-10",
            lastLogin: "2024-01-19"
          },
          {
            id: "3",
            firstName: "Mike",
            lastName: "Johnson",
            email: "mike.johnson@example.com",
            role: "user",
            status: "inactive",
            createdAt: "2024-01-05",
            lastLogin: "2024-01-15"
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadUsers();
  }, []);

  const statusOptions = [
    { label: "All", value: null },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Suspended", value: "suspended" }
  ];

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "warning";
      case "suspended": return "danger";
      default: return "info";
    }
  };

  const getRoleIcon = (role: string) => {
    return role === "admin" ? <Shield size={16} /> : <Users size={16} />;
  };

  const actionBodyTemplate = () => {
    return (
      <div className="flex gap-2">
        <Button icon={<Eye size={16} />} size="small" text />
        <Button icon={<Pencil size={16} />} size="small" text />
        <Button icon={<Trash size={16} />} size="small" text severity="danger" />
      </div>
    );
  };

  const header = (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div className="flex items-center gap-3">
        <Users size={24} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
      </div>
      <div className="flex gap-2">
        <Button
          label="Add User"
          icon={<UserPlus size={16} />}
          className="bg-blue-600 hover:bg-blue-700"
        />
      </div>
    </div>
  );

  const filters = (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        <span className="p-input-icon-left w-full">
          <MagnifyingGlass className="p-input-icon-left" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search users..."
            className="w-full"
          />
        </span>
      </div>
      <div className="w-full sm:w-48">
        <Dropdown
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder="Filter by status"
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card header={header}>
          {filters}
          <DataTable
            value={users}
            loading={loading}
            globalFilter={globalFilter}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            className="p-datatable-sm"
            emptyMessage="No users found."
          >
            <Column field="firstName" header="First Name" sortable />
            <Column field="lastName" header="Last Name" sortable />
            <Column field="email" header="Email" sortable />
            <Column
              field="role"
              header="Role"
              sortable
              body={(rowData) => (
                <div className="flex items-center gap-2">
                  {getRoleIcon(rowData.role)}
                  <span className="capitalize">{rowData.role}</span>
                </div>
              )}
            />
            <Column
              field="status"
              header="Status"
              sortable
              body={(rowData) => (
                <Badge
                  value={rowData.status}
                  severity={getStatusSeverity(rowData.status)}
                />
              )}
            />
            <Column field="createdAt" header="Created" sortable />
            <Column field="lastLogin" header="Last Login" sortable />
            <Column header="Actions" body={actionBodyTemplate} />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}
