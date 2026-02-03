
import { BillingPackage, Project, Client } from '../types';

export const generateInvoicePDF = async (pkg: BillingPackage, project: Project, client: Client) => {
  console.log('Generating Invoice PDF for:', pkg.invoice.invoiceNumber);
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockBlob = new Blob([`Invoice ${pkg.invoice.invoiceNumber} for ${project.name}`], { type: 'application/pdf' });
      const url = URL.createObjectURL(mockBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${pkg.invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve(true);
    }, 800);
  });
};

export const generateStatusReportPDF = async (pkg: BillingPackage, project: Project, client: Client) => {
  console.log('Generating Status Report PDF with Images:', pkg.statusReport.images.length);
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockBlob = new Blob([`Status Report for ${project.name} - Period ${pkg.billingPeriodEnd}`], { type: 'application/pdf' });
      const url = URL.createObjectURL(mockBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StatusReport-${pkg.invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve(true);
    }, 1200);
  });
};

export const sendPackageToClient = async (pkg: BillingPackage, email: string) => {
  console.log(`Emailing Package ${pkg.id} to ${email}`);
  console.log(`Attachments: Invoice-${pkg.invoice.invoiceNumber}.pdf, StatusReport-${pkg.invoice.invoiceNumber}.pdf`);
  return new Promise(resolve => setTimeout(() => resolve(true), 2000));
};
