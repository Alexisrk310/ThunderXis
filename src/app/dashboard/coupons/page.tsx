'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'
import { Tag, Plus, Trash2, Calendar, Percent, DollarSign, Loader2 } from 'lucide-react'
import { createCoupon, deleteCoupon, toggleCouponStatus, updateCoupon } from './actions'
import { Pencil } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { format } from 'date-fns'

interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  expiration_date: string | null
  usage_limit: number | null
  min_purchase_amount: number
  max_discount_amount?: number | null
  is_active: boolean
  usage_count: number
}

export default function CouponsPage() {
  const { t } = useLanguage()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [expirationDate, setExpirationDate] = useState<Date | undefined>()
  
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all')

  useEffect(() => {
    if (editingCoupon?.expiration_date) {
        // Adjust for potential timezone issues if stored as UTC but meant as local date?
        // Usually YYYY-MM-DD string is parsed as UTC midnight.
        // We want to show it as the selected date.
        // new Date('2023-12-25') -> UTC midnight.
        // If we display it in local time, it might show previous day if timezone is -5.
        // Safe bet: Parse components manually or append T00:00:00 and handle timezone.
        // Or simple: new Date(editingCoupon.expiration_date + 'T12:00:00') to be safe mid-day.
        // Actually date-fns/react-day-picker handles Dates.
        // Let's rely on standard parsing for now, or add timezone offset fix if user complains.
        const date = new Date(editingCoupon.expiration_date)
        // Fix for "off by one day" due to UTC->Local conversion if storing YYYY-MM-DD
        // Ensure we display the intended day.
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
        setExpirationDate(adjustedDate)
    } else {
        setExpirationDate(undefined)
    }
  }, [editingCoupon])
  
  // Basic fetch - could be server component but client is fine for admin
  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setCoupons(data as Coupon[])
    setLoading(false)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCoupon(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.are_you_sure') || 'Are you sure?')) return
    await deleteCoupon(id)
    fetchCoupons()
  }

  const handleToggle = async (coupon: Coupon) => {
    await toggleCouponStatus(coupon.id, coupon.is_active)
    fetchCoupons()
  }

  const getStatus = (coupon: Coupon) => {
    if (!coupon.is_active) return 'inactive'
    if (coupon.expiration_date) {
        // Fix: Expiration should be at the END of the day
        const expDate = new Date(coupon.expiration_date)
        expDate.setHours(23, 59, 59, 999) // Valid until very end of that day
        
        const now = new Date()
        
        if (expDate < now) return 'expired'
    }
    return 'active'
  }

  const filteredCoupons = coupons.filter(coupon => {
    if (filter === 'all') return true
    return getStatus(coupon) === filter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Tag className="w-8 h-8 text-primary" />
            {t('dash.coupons') || 'Coupons'}
          </h1>
          <p className="text-muted-foreground text-sm">{t('dash.manage_coupons') || 'Manage discount codes'}</p>
        </div>
        <button 
          onClick={() => {
            setEditingCoupon(null)
            setIsModalOpen(true)
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('add_coupon') || 'Create Coupon'}
        </button>
      </div>

       {/* ... (Keep Filters) */}
       <div className="flex gap-1 bg-muted/30 p-1 rounded-xl w-fit border border-border/50">
        {(['all', 'active', 'expired', 'inactive'] as const).map((f) => (
            <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                    filter === f 
                        ? 'bg-card text-primary shadow-sm border border-border/50' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
                {t(`dash.${f}`) || f}
            </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-xl">
           <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
           <p className="text-muted-foreground">{t('no_coupons') || 'No coupons found'}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCoupons.map((coupon) => {
            const status = getStatus(coupon)
            return (
            <div key={coupon.id} className={`bg-card border ${status === 'active' ? 'border-border' : status === 'expired' ? 'border-orange-500/20 bg-orange-500/5' : 'border-red-500/20 bg-red-500/5'} rounded-xl p-5 shadow-sm relative overflow-hidden group transition-all`}>
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black font-mono tracking-wider text-primary">{coupon.code}</h3>
                    {(() => {
                        let badgeClass = ''
                        let statusText = ''
                        switch (status) {
                            case 'active':
                                badgeClass = 'bg-green-100 text-green-700 border-green-200'
                                statusText = t('dash.active')
                                break
                            case 'expired':
                                badgeClass = 'bg-orange-100 text-orange-700 border-orange-200'
                                statusText = t('dash.expired')
                                break
                            case 'inactive':
                                badgeClass = 'bg-red-100 text-red-700 border-red-200'
                                statusText = t('dash.inactive')
                                break
                        }
                        return (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}>
                                {statusText}
                            </span>
                        )
                    })()}
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => handleToggle(coupon)}
                       className="p-2 hover:bg-muted rounded-full transition-colors opacity-0 group-hover:opacity-100"
                       title="Toggle Status"
                     >
                        <Loader2 className="w-4 h-4" /> 
                     </button>
                     <button 
                       onClick={() => handleEdit(coupon)}
                       className="p-2 hover:bg-blue-100 text-blue-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                       title="Edit"
                     >
                       <Pencil className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleDelete(coupon.id)}
                       className="p-2 hover:bg-red-100 text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               
               <div className="space-y-2 text-sm text-foreground/80">
                  <div className="flex items-center gap-2">
                    {coupon.discount_type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                    <span className="font-bold">
                      {coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : ' COP'}
                    </span>
                    <span className="text-muted-foreground">{t('dash.discount_label')}</span>
                  </div>
                  
                  {coupon.expiration_date && (
                    <div className={`flex items-center gap-2 ${status === 'expired' ? 'text-orange-600 font-bold' : 'text-muted-foreground'}`}>
                      <Calendar className="w-4 h-4" />
                      <span>Exp: {new Date(coupon.expiration_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>Used: {coupon.usage_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : ''}</span>
                    <span>Min: ${coupon.min_purchase_amount}</span>
                  </div>
               </div>
            </div>
          )})}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
             <div className="p-6 border-b border-border">
               <h2 className="text-xl font-bold">{editingCoupon ? (t('edit_coupon') || 'Edit Coupon') : (t('create_coupon') || 'Create New Coupon')}</h2>
             </div>
             <form action={async (formData) => {
                 setFormLoading(true)
                 let res;
                 if (editingCoupon) {
                    res = await updateCoupon(editingCoupon.id, formData)
                 } else {
                    res = await createCoupon(formData)
                 }
                 setFormLoading(false)
                 if (res?.error) {
                    alert(res.error)
                 } else {
                    handleCloseModal()
                    fetchCoupons()
                 }
             }} className="p-6 space-y-4">
                 
                 <div>
                   <label className="block text-sm font-medium mb-1">{t('dash.coupon_code')}</label>
                   <input 
                      name="code" 
                      required 
                      defaultValue={editingCoupon?.code || ''}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 font-mono uppercase" 
                      placeholder="SUMMER25" 
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('dash.type')}</label>
                        <select 
                            name="discountType" 
                            defaultValue={editingCoupon?.discount_type || 'percentage'}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2"
                            onChange={(e) => {
                                const maxDiscountInput = document.getElementById('maxDiscountInput');
                                if (maxDiscountInput) {
                                    if (e.target.value === 'fixed') {
                                        maxDiscountInput.style.display = 'none';
                                    } else {
                                        maxDiscountInput.style.display = 'block';
                                    }
                                }
                            }}
                        >
                            <option value="percentage">{t('dash.type_percentage')}</option>
                            <option value="fixed">{t('dash.type_fixed')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('dash.value')}</label>
                        <input 
                            name="discountValue" 
                            type="number" 
                            step="0.01" 
                            required 
                            defaultValue={editingCoupon?.discount_value || ''}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2" 
                            placeholder="10.00" 
                        />
                    </div>
                 </div>

                 {/* Logic to hide/show this on edit based on type needs more advanced state or just show/hide CSS which we did with ID above. 
                     Ideally should sync with state, but keeping it simple with display check
                 */}
                 <div id="maxDiscountInput" style={{ display: (editingCoupon?.discount_type === 'fixed') ? 'none' : 'block' }}>
                    <label className="block text-sm font-medium mb-1">{t('dash.max_discount')}</label>
                    <input 
                        name="maxDiscountAmount" 
                        type="number" 
                        step="0.01" 
                        defaultValue={editingCoupon?.max_discount_amount || ''} // Note: This field needs to be added to Coupon interface? Check action.
                        className="w-full bg-background border border-border rounded-lg px-3 py-2" 
                        placeholder="e.g. 50000" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t('coupons.optional_percentage') || 'Optional. Only applies to percentage discounts.'}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('dash.min_purchase')}</label>
                        <input 
                            name="minPurchase" 
                            type="number" 
                            step="0.01" 
                            defaultValue={editingCoupon?.min_purchase_amount || 0}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('dash.usage_limit')}</label>
                        <input 
                            name="usageLimit" 
                            type="number" 
                            defaultValue={editingCoupon?.usage_limit || ''}
                            placeholder={t('dash.unlimited') || 'Unlimited'} 
                            className="w-full bg-background border border-border rounded-lg px-3 py-2" 
                        />
                    </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium mb-1">{t('dash.expiration')}</label>
                   <DatePicker 
                        value={expirationDate?.toISOString().split('T')[0] || ''} 
                        onChange={(d) => {
                             // d is string "yyyy-mm-dd" or ""
                             if (d) {
                                 const [y, m, day] = d.split('-').map(Number)
                                 setExpirationDate(new Date(y, m-1, day))
                             } else {
                                 setExpirationDate(undefined)
                             }
                        }}
                        placeholder={t('dash.pick_expiration') || 'Pick a date'}
                        maxDate={new Date(2100, 0, 1)}
                   />
                   <input type="hidden" name="expirationDate" value={expirationDate ? format(expirationDate, 'yyyy-MM-dd') : ''} />
                 </div>  

                 <div className="flex gap-3 pt-3">
                   <button 
                     type="button" 
                     onClick={handleCloseModal}
                     className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                   >
                     {t('dash.cancel')}
                   </button>
                   <button 
                     type="submit" 
                     disabled={formLoading}
                     className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                   >
                      {formLoading ? (editingCoupon ? (t('common.updating') || 'Updating...') : t('dash.creating')) : (editingCoupon ? (t('coupons.update_btn') || 'Update Coupon') : t('add_coupon'))}
                    </button>
                 </div>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
