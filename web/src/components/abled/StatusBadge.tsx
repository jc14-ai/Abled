import { BeneficiaryStatus } from '@/lib/abled-contract';

export function StatusBadge({ status }: { status: BeneficiaryStatus }) {
  switch (status) {
    case BeneficiaryStatus.Pending:
      return <span className="status-badge status-pending">Pending</span>;
    case BeneficiaryStatus.Verified:
      return <span className="status-badge status-verified">Verified</span>;
    case BeneficiaryStatus.Rejected:
      return <span className="status-badge status-rejected">Rejected</span>;
    default:
      return null;
  }
}
