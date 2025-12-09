import React, { useState } from 'react';
import { Search, Filter, Download, Trash2, FileText, Calendar, DollarSign, Building2, FileDown, Edit2, Mail } from 'lucide-react';

export function ArchiveView({ proposals, companies, onDelete, onExport, onEdit }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCompany, setFilterCompany] = useState('');
    const [filterPreparer, setFilterPreparer] = useState('');

    // Extract unique preparers from proposals
    const preparers = [...new Set(proposals.map(p => p.preparer).filter(Boolean))];

    const filteredProposals = proposals.filter(proposal => {
        const matchesSearch = !searchTerm ||
            proposal.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.proposalNo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCompany = !filterCompany || proposal.company?.id === parseInt(filterCompany);
        const matchesPreparer = !filterPreparer || proposal.preparer === filterPreparer;

        return matchesSearch && matchesCompany && matchesPreparer;
    });

    const getCompanyName = (companyId) => {
        const company = companies.find(c => c.id === companyId);
        return company ? company.name : 'Firma Belirtilmemiş';
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem' }}>Teklif Arşivi</h2>

            {/* Filters Bar */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                    <Filter size={20} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Filtrele:</span>
                </div>

                <div style={{ position: 'relative', minWidth: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-muted))' }} />
                    <input
                        type="text"
                        placeholder="Teklif No veya Ürün Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem 0.5rem 0.5rem 2.2rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            color: 'white'
                        }}
                    />
                </div>

                <select
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'white',
                        minWidth: '150px'
                    }}
                >
                    <option value="">Tüm Firmalar</option>
                    {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select
                    value={filterPreparer}
                    onChange={(e) => setFilterPreparer(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'white',
                        minWidth: '150px'
                    }}
                >
                    <option value="">Tüm Teklif Verenler</option>
                    {preparers.map((p, index) => (
                        <option key={index} value={p}>{p}</option>
                    ))}
                </select>

                {(searchTerm || filterCompany || filterPreparer) && (
                    <button
                        onClick={() => { setSearchTerm(''); setFilterCompany(''); setFilterPreparer(''); }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                        <Trash2 size={14} /> Temizle
                    </button>
                )}
            </div>

            {/* Proposals List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredProposals.map((proposal) => (
                    <div key={proposal.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '2rem', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem' }}>
                                    Teklif No
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {proposal.proposalNo}
                                    {proposal.version && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            background: 'rgba(14, 99, 156, 0.2)',
                                            color: 'hsl(var(--color-accent))',
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            fontWeight: 'bold'
                                        }}>
                                            {proposal.version}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-secondary))', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={14} />
                                    {new Date(proposal.date).toLocaleDateString('tr-TR')}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem' }}>
                                    Firma
                                </div>
                                <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Building2 size={16} style={{ color: 'hsl(var(--color-accent))' }} />
                                    {getCompanyName(proposal.company?.id)}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-secondary))', marginTop: '0.25rem' }}>
                                    {proposal.items && proposal.items.length > 1
                                        ? `Çoklu Ürün (${proposal.items.length} Kalem)`
                                        : proposal.product.name}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem' }}>
                                    Teklif Tutarı
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'hsl(var(--color-success))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <DollarSign size={18} />
                                    ${(proposal.totalPrice || proposal.calculation.suggested_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-secondary))', marginTop: '0.25rem' }}>
                                    ₺{(proposal.totalPriceTry || proposal.calculation.price_try).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    onClick={() => onEdit(proposal)}
                                    className="btn-secondary"
                                    style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    <Edit2 size={16} />
                                    Düzenle
                                </button>
                                <button
                                    onClick={() => {
                                        const companyEmail = proposal.company?.email || '';
                                        const subject = `Teklif: ${proposal.proposalNo} ${proposal.version || ''}`;
                                        const body = `Sayın ${proposal.company?.contact_person || 'Yetkili'},\n\nEk'te ${proposal.proposalNo} ${proposal.version || ''} numaralı teklifimizi bulabilirsiniz.\n\nTeklif Özeti:\n- Teklif No: ${proposal.proposalNo} ${proposal.version || ''}\n- Tarih: ${new Date(proposal.date).toLocaleDateString('tr-TR')}\n- Tutar: $${(proposal.totalPrice || proposal.calculation.suggested_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\nSorularınız için lütfen bizimle iletişime geçin.\n\nSaygılarımızla,\n${proposal.preparedBy?.name || proposal.preparer || ''}`;
                                        window.location.href = `mailto:${companyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                    }}
                                    style={{
                                        padding: '0.65rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem',
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        borderRadius: '8px',
                                        color: '#22c55e',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Mail size={16} />
                                    Email
                                </button>
                                <button
                                    onClick={() => onExport(proposal, 'pdf')}
                                    className="btn-warning"
                                    style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                                >
                                    <FileDown size={16} />
                                    PDF
                                </button>
                                <button
                                    onClick={() => onExport(proposal, 'word')}
                                    className="btn-primary"
                                    style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                                >
                                    <FileDown size={16} />
                                    Word
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
                                            onDelete(proposal.id);
                                        }
                                    }}
                                    style={{
                                        padding: '0.65rem 1rem',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProposals.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'hsl(var(--color-text-muted))' }}>
                    <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>
                        {proposals.length === 0
                            ? 'Henüz teklif oluşturulmamış.'
                            : 'Filtrelere uygun teklif bulunamadı.'}
                    </p>
                </div>
            )}

            {filteredProposals.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', color: 'hsl(var(--color-text-secondary))' }}>
                    Toplam {filteredProposals.length} teklif gösteriliyor
                </div>
            )}
        </div>
    );
}
