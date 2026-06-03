import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminPage } from './AdminPage';

const adminMocks = vi.hoisted(() => ({
  employeeList: vi.fn(),
  departmentList: vi.fn(),
  shiftList: vi.fn(),
  deviceList: vi.fn(),
}));

vi.mock('@/services/employeeService', () => ({ employeeService: { list: adminMocks.employeeList } }));
vi.mock('@/services/departmentService', () => ({ departmentService: { list: adminMocks.departmentList } }));
vi.mock('@/services/shiftService', () => ({ shiftService: { list: adminMocks.shiftList } }));
vi.mock('@/services/deviceService', () => ({ deviceService: { list: adminMocks.deviceList } }));
vi.mock('./AdminNav', () => ({ AdminNav: () => null }));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminMocks.employeeList.mockResolvedValue({
      success: true,
      data: [
        {
          employee_id: 1,
          department_id: 1,
          department_name: 'Administration',
          full_name: 'System Admin',
          email: 'admin@example.com',
          position: 'Admin',
          status: 'active',
        },
      ],
    });
    adminMocks.departmentList.mockResolvedValue({ success: true, data: [{ department_id: 1, name: 'Administration' }] });
    adminMocks.shiftList.mockResolvedValue({ success: true, data: [] });
    adminMocks.deviceList.mockResolvedValue({ success: true, data: [] });
  });

  it('requests employees and devices within the backend limit of 100', async () => {
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('System Admin')).toBeInTheDocument());
    expect(adminMocks.employeeList).toHaveBeenCalledWith({ limit: 100 });
    expect(adminMocks.deviceList).toHaveBeenCalledWith({ limit: 100 });
  });
});
