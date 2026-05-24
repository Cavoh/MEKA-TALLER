import React from 'react';
import { 
  CriticalStockChart, ServiceStatsChart, DailyRevenueChart, 
  TopProductsChart, SalesByMechanicChart, SalesDistributionChart 
} from './AnalyticsCharts';

interface AnalyticsDashboardProps {
  analytics: any;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CriticalStockChart data={analytics.criticalStock} />
      <ServiceStatsChart data={analytics.servicesData} />
      <SalesByMechanicChart data={analytics.mechanicSales} />
      <DailyRevenueChart data={analytics.dailyRevenue} />
      <SalesDistributionChart data={analytics.salesDist} />
      <TopProductsChart data={analytics.topProducts} />
    </div>
  );
};
