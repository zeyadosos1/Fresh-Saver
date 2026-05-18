import { Injectable, signal } from '@angular/core';

export interface Deal {
  id: number;
  vendor_id: number;
  vendor_name: string;
  item_name: string;
  category: string;
  original_price: number;
  discounted_price: number;
  expiry_date: string;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  private _deals = signal<Deal[]>([]);
  readonly deals = this._deals.asReadonly();

  private baseUrl = 'http://localhost/project_framework/api';

  async fetchDeals(category?: string): Promise<void> {
    const url = category
      ? `${this.baseUrl}/deals.php?category=${encodeURIComponent(category)}`
      : `${this.baseUrl}/deals.php`;

    try {
      const res  = await fetch(url);
      const json = await res.json();
      this._deals.set(json.success ? json.data : []);
    } catch {
      console.error('Could not fetch deals — is XAMPP running?');
    }
  }

  async addDeal(deal: Omit<Deal, 'id' | 'vendor_name'>, vendorId: number): Promise<boolean> {
    const form = new FormData();
    form.append('action', 'add');
    form.append('vendor_id', String(vendorId));
    Object.entries(deal).forEach(([k, v]) => form.append(k, String(v)));

    const res  = await fetch(`${this.baseUrl}/deal_actions.php`, { method: 'POST', body: form });
    const json = await res.json();
    return json.success;
  }

  async editDeal(id: number, deal: Partial<Deal>, vendorId: number): Promise<boolean> {
    const form = new FormData();
    form.append('action', 'edit');
    form.append('deal_id', String(id));
    form.append('vendor_id', String(vendorId));
    Object.entries(deal).forEach(([k, v]) => form.append(k, String(v)));

    const res  = await fetch(`${this.baseUrl}/deal_actions.php`, { method: 'POST', body: form });
    const json = await res.json();
    return json.success;
  }

  async deleteDeal(id: number): Promise<boolean> {
    const form = new FormData();
    form.append('action', 'delete');
    form.append('deal_id', String(id));

    const res  = await fetch(`${this.baseUrl}/deal_actions.php`, { method: 'POST', body: form });
    const json = await res.json();
    return json.success;
  }

  async fetchVendorDeals(vendorId: number): Promise<Deal[]> {
    const res  = await fetch(`${this.baseUrl}/deals.php?vendor_id=${vendorId}`);
    const json = await res.json();
    return json.success ? json.data : [];
  }

  async reserveItems(userId: number, items: { deal_id: number, qty: number }[]): Promise<boolean> {
    const form = new FormData();
    form.append('user_id', String(userId));
    form.append('items', JSON.stringify(items));

    const res = await fetch(`${this.baseUrl}/reserve.php`, { method: 'POST', body: form });
    const json = await res.json();
    return json.success;
  }

  async fetchReservations(userId: number): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/reservations.php?user_id=${userId}`);
    const json = await res.json();
    return json.success ? json.data.reservations : [];
  }
}
