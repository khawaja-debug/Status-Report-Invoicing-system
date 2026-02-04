
import { Request, Response } from 'express';
import BillingPackage from '../models/BillingPackage';
import Company from '../models/Company';
import Project from '../models/Project';
import { amountToWords } from '../services/amountToWords';

export const createPackage = async (req: Request, res: Response) => {
  try {
    const pkgData = req.body;
    
    // Find project and company
    const project = await Project.findById(pkgData.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const company = await Company.findById(project.companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Generate Invoice Number if missing
    if (!pkgData.invoice.invoiceNumber) {
      const prefix = company.defaults.invoicePrefix || 'INV/';
      const counter = company.defaults.invoiceCounter;
      pkgData.invoice.invoiceNumber = `${prefix}${counter}`;
      
      // Increment company counter
      company.defaults.invoiceCounter += 1;
      await company.save();
    }

    // Ensure amount in words is correct
    pkgData.invoice.amountInWords = amountToWords(pkgData.invoice.totals.grandTotal);
    
    const newPackage = new BillingPackage({
      ...pkgData,
      companyId: company._id,
      createdBy: (req as any).user.id
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPackages = async (req: Request, res: Response) => {
  try {
    const { projectId, companyId } = req.query;
    const filter: any = {};
    if (projectId) filter.projectId = projectId;
    if (companyId) filter.companyId = companyId;

    const packages = await BillingPackage.find(filter).sort({ createdAt: -1 });
    res.json(packages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const pkg = await BillingPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
