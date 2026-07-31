import { Request, Response } from 'express';
import { associateAdminService } from '../services/associateAdmin.service';

export const associateAdminController = {
  async create(req: Request, res: Response) {
    const { email, fullName, department } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ success: false, message: 'email and fullName are required' });
    }
    try {
      const result = await associateAdminService.createAssociate(email, fullName, department);
      return res.status(201).json({ success: true, message: 'Associate created', data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to create associate' });
    }
  },

  async list(_req: Request, res: Response) {
    const result = await associateAdminService.listAssociates();
    return res.json({ success: true, data: result });
  }
};
