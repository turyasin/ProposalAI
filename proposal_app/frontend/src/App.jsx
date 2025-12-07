import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, Calculator, ChevronRight, DollarSign, Activity, Building2, Archive, Upload, FileDown, Package, Bot, FileSignature, Plus, Trash2, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

import { products as productsData } from './products';
import { CompaniesView } from './CompaniesView';
import { ArchiveView } from './ArchiveView';
import { ProposalDraftModal } from './ProposalDraftModal';
import html2pdf from 'html2pdf.js';
import ReactDOM from 'react-dom/client';
import { ProposalTemplate } from './ProposalTemplate';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [costParams, setCostParams] = useState({
    labor_hourly_rate: 45.0,
    overhead_percentage: 50.0,
    profit_margin: 125.0,
    currency_rate: 42.5
  });
  // Store both material cost and labor hours overrides
  const [productCustomizations, setProductCustomizations] = useState({});
  const [calculation, setCalculation] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalBasket, setProposalBasket] = useState([]);
  const [editingProposal, setEditingProposal] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load proposals and companies from localStorage on mount
  useEffect(() => {
    const savedProposals = localStorage.getItem('proposals');
    if (savedProposals) {
      setProposals(JSON.parse(savedProposals));
    }

    const savedCompanies = localStorage.getItem('companies');
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }

    const savedCustomizations = localStorage.getItem('productCustomizations');
    if (savedCustomizations) {
      setProductCustomizations(JSON.parse(savedCustomizations));
    } else {
      // Fallback for migration from old key
      const oldCosts = localStorage.getItem('productMaterialCosts');
      if (oldCosts) {
        const parsed = JSON.parse(oldCosts);
        const migrated = {};
        Object.keys(parsed).forEach(key => {
          migrated[key] = { material_cost: parsed[key] };
        });
        setProductCustomizations(migrated);
      }
    }
  }, []);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(productsData);
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products]);

  const addToBasket = (product, calc, quantity = 1) => {
    const newItem = {
      id: Date.now(),
      product: product,
      calculation: calc,
      quantity: parseInt(quantity) || 1
    };
    setProposalBasket([...proposalBasket, newItem]);
    alert(`${quantity} adet ${product.name} teklife eklendi!`);
  };

  const removeFromBasket = (itemId) => {
    setProposalBasket(proposalBasket.filter(item => item.id !== itemId));
  };

  const updateBasketItem = (itemId, product, calculation, quantity) => {
    setProposalBasket(proposalBasket.map(item =>
      item.id === itemId
        ? { ...item, product, calculation, quantity: parseInt(quantity) || 1 }
        : item
    ));
  };

  const handleImportProducts = (newProducts) => {
    // Validate and merge products
    const validProducts = newProducts.filter(p => p.id && p.name);
    if (validProducts.length === 0) {
      alert('Geçerli ürün bulunamadı. Lütfen şablonu kontrol edin.');
      return;
    }

    // Merge with existing products (avoid duplicates by ID)
    const existingIds = new Set(products.map(p => p.id));
    const uniqueNewProducts = validProducts.filter(p => !existingIds.has(p.id));

    if (uniqueNewProducts.length === 0) {
      alert('Yüklenen ürünlerin hepsi zaten mevcut.');
      return;
    }

    setProducts([...products, ...uniqueNewProducts]);
    alert(`${uniqueNewProducts.length} yeni ürün başarıyla eklendi!`);
  };

  const handleEditProposal = (proposal) => {
    setEditingProposal(proposal);
    setProposalBasket(proposal.items || [{ product: proposal.product, calculation: proposal.calculation, quantity: 1 }]);
    setActiveTab('costing');
    alert("Düzenleme modu aktif. Sepetteki ürünleri güncelleyebilir veya yeni ürün ekleyebilirsiniz.");
  };

  const handleCalculate = (product, specificMaterialCost = null, specificLaborHours = null) => {
    console.log("Calculating for:", product);
    try {
      setSelectedProduct(product);

      // Local Calculation Logic
      if (!product.base_cost_factors) {
        throw new Error("Maliyet faktörleri eksik!");
      }

      const factors = product.base_cost_factors;
      const customization = productCustomizations[product.id] || {};

      // 1. Hammadde Maliyeti
      const material_cost = specificMaterialCost !== null
        ? specificMaterialCost
        : (customization.material_cost || 0);

      // 2. İşçilik Maliyeti (Saat * Saatlik Ücret)
      const labor_hours = specificLaborHours !== null
        ? specificLaborHours
        : (customization.labor_hours !== undefined ? customization.labor_hours : factors.labor_hours);

      const labor_cost = labor_hours * costParams.labor_hourly_rate;

      // 3. Genel Giderler ((Hammadde + İşçilik) * %)
      const base_cost = material_cost + labor_cost;
      const overhead = base_cost * (costParams.overhead_percentage / 100);

      const total_cost = base_cost + overhead;
      const price = total_cost * (1 + (costParams.profit_margin / 100));

      const calcResult = {
        product_id: product.id,
        raw_material_cost: material_cost,
        labor_hours: labor_hours, // Store hours for display
        labor_cost: labor_cost,
        overhead_cost: overhead,
        total_cost: total_cost,
        suggested_price: price,
        currency: "USD",
        price_try: price * costParams.currency_rate
      };

      console.log("Calculation Result:", calcResult);
      setCalculation(calcResult);
    } catch (err) {
      console.error("Calculation Error:", err);
      alert("Hesaplama hatası: " + err.message);
    }
  };

  const saveProposal = (proposalData) => {
    let updated;
    if (editingProposal) {
      // Update existing
      const updatedProposal = {
        ...editingProposal,
        ...proposalData,
        id: editingProposal.id,
        date: new Date().toISOString()
      };
      updated = proposals.map(p => p.id === editingProposal.id ? updatedProposal : p);
    } else {
      // Create new
      const newProposal = {
        id: Date.now(),
        date: new Date().toISOString(),
        ...proposalData
      };
      updated = [newProposal, ...proposals];
    }

    setProposals(updated);
    localStorage.setItem('proposals', JSON.stringify(updated));
    return editingProposal ? editingProposal.id : updated[0].id;
  };

  const deleteProposal = (id) => {
    const updated = proposals.filter(p => p.id !== id);
    setProposals(updated);
    localStorage.setItem('proposals', JSON.stringify(updated));
  };

  const saveCompany = (companyData) => {
    const newCompany = {
      id: Date.now(),
      ...companyData
    };
    const updated = [...companies, newCompany];
    setCompanies(updated);
    localStorage.setItem('companies', JSON.stringify(updated));
    return newCompany.id;
  };

  const deleteCompany = (id) => {
    const updated = companies.filter(c => c.id !== id);
    setCompanies(updated);
    localStorage.setItem('companies', JSON.stringify(updated));
  };


  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1001,
          background: 'hsl(var(--color-accent))',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem',
          cursor: 'pointer',
          display: 'none',
          color: 'white'
        }}
        className="mobile-menu-toggle"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className="glass-panel"
        style={{
          width: '280px',
          margin: '1rem',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          position: isMobileMenuOpen ? 'fixed' : 'relative',
          top: isMobileMenuOpen ? 0 : 'auto',
          left: isMobileMenuOpen ? 0 : 'auto',
          height: isMobileMenuOpen ? '100vh' : 'auto',
          zIndex: isMobileMenuOpen ? 1000 : 'auto',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'hsl(var(--color-accent))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSignature size={28} />
          Proposal<span style={{ color: 'white' }}>AI</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Genel Bakış" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Package size={20} />} label="Ürünler" active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }} />
          <NavItem
            icon={<Calculator size={20} />}
            label="Maliyet/Teklif"
            active={activeTab === 'costing'}
            onClick={() => { setActiveTab('costing'); setIsMobileMenuOpen(false); }}
          />  <NavItem icon={<Building2 size={20} />} label="Firmalar" active={activeTab === 'companies'} onClick={() => { setActiveTab('companies'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Archive size={20} />} label="Teklif Arşivi" active={activeTab === 'archive'} onClick={() => { setActiveTab('archive'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Settings size={20} />} label="Parametreler" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} />
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              {activeTab === 'dashboard' && 'Genel Bakış'}
              {activeTab === 'products' && 'Ürün Kataloğu'}
              {activeTab === 'costing' && 'Maliyet & Fiyatlandırma'}
              {activeTab === 'settings' && 'Parametreler'}
            </h1>
            <p style={{ color: 'hsl(var(--color-text-secondary))' }}>Tekliflendirme AI Çalışanı</p>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView products={products} proposals={proposals} />}
        {activeTab === 'products' && <ProductsView products={products} onImport={handleImportProducts} />}
        {activeTab === 'costing' && (
          <CostingView
            products={products}
            selectedProduct={selectedProduct}
            onSelect={handleCalculate}
            calculation={calculation}
            params={costParams}
            setParams={setCostParams}
            companies={companies}
            onOpenProposalModal={() => setShowProposalModal(true)}
            productCustomizations={productCustomizations}
            setProductCustomizations={setProductCustomizations}
            basket={proposalBasket}
            onAddToBasket={addToBasket}
            onRemoveFromBasket={removeFromBasket}
            onUpdateBasketItem={updateBasketItem}
          />
        )}
        {activeTab === 'reqs' && <RequirementsView products={products} />}
        {activeTab === 'companies' && (
          <CompaniesView
            companies={companies}
            onSave={saveCompany}
            onDelete={deleteCompany}
          />
        )}
        {activeTab === 'archive' && (
          <ArchiveView
            proposals={proposals}
            companies={companies}
            onDelete={deleteProposal}
            onEdit={handleEditProposal}
            onExport={async (proposal, format) => {
              try {
                if (format === 'pdf') {
                  const { exportProposalAsPDF } = await import('./exportUtils.jsx');
                  await exportProposalAsPDF(proposal);
                  alert(`PDF başarıyla oluşturuldu: ${proposal.proposalNo}`);
                } else if (format === 'word') {
                  const { exportProposalAsWord } = await import('./exportUtils.jsx');
                  await exportProposalAsWord(proposal);
                  alert(`Word dosyası başarıyla oluşturuldu: ${proposal.proposalNo}`);
                }
              } catch (error) {
                console.error('Export error:', error);
                alert(`Export hatası: ${error.message}`);
              }
            }}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            params={costParams}
            setParams={setCostParams}
          />
        )}
      </main>

      {/* Proposal Draft Modal */}
      <ProposalDraftModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        onCancel={() => {
          setShowProposalModal(false);
          setEditingProposal(null);
          setProposalBasket([]);
        }}
        product={selectedProduct}
        calculation={calculation}
        params={costParams}
        companies={companies}
        onSave={saveProposal}
        basket={proposalBasket}
        initialData={editingProposal}
      />
    </div >
  );
}

// --- Sub-Components ---

function DashboardView({ products, proposals }) {
  // Calculate Statistics
  const totalProposals = proposals ? proposals.length : 0;

  const totalAmount = proposals ? proposals.reduce((sum, p) => {
    return sum + (p.totalPrice || p.calculation?.suggested_price || 0);
  }, 0) : 0;

  // Calculate sales per product
  const productStats = {};
  if (proposals) {
    proposals.forEach(p => {
      // Handle both multi-item and single-item proposals
      const items = p.items && p.items.length > 0
        ? p.items
        : [{ product: p.product, calculation: p.calculation, quantity: 1 }];

      items.forEach(item => {
        const pId = item.product.id;
        if (!productStats[pId]) {
          productStats[pId] = {
            name: item.product.name,
            count: 0,
            revenue: 0
          };
        }
        productStats[pId].count += (item.quantity || 1);
        productStats[pId].revenue += (item.calculation.suggested_price * (item.quantity || 1));
      });
    });
  }

  // Convert to array and sort by count (descending)
  const sortedProductStats = Object.values(productStats).sort((a, b) => b.count - a.count);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Toplam Teklif Sayısı" value={totalProposals} trend="Adet" />
        <StatCard
          title="Toplam Teklif Tutarı"
          value={`$${totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0, notation: "compact", compactDisplay: "short" })}`}
          trend="USD"
        />
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📊</span> Ürün Bazlı Teklif Analizi
        </h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {sortedProductStats.length > 0 ? sortedProductStats.map((stat, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: index === 0 ? 'hsl(var(--color-accent))' : 'rgba(255,255,255,0.1)',
                  color: index === 0 ? 'black' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1rem' }}>{stat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>Toplam Satış Hacmi</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'hsl(var(--color-accent))' }}>{stat.count} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'hsl(var(--color-text-secondary))' }}>Adet</span></div>
                <div style={{ fontSize: '0.9rem', color: 'hsl(var(--color-success))', fontWeight: '500' }}>${stat.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', color: 'hsl(var(--color-text-muted))', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              Henüz teklif verisi bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsView({ products, onImport }) {
  const fileInputRef = React.useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    specs: {
      sections: '',
      diameter_mm: '',
      payload_capacity_kg: '',
      voltage: '',
      dimensions_raw: '',
      features: ''
    },
    base_cost_factors: {
      labor_hours: '',
      material_cost: ''
    }
  });

  const downloadTemplate = () => {
    const headers = "id,name,sections,diameter_mm,payload_capacity_kg,voltage,dimensions_raw,base_labor_hours,base_material_cost,features";
    const example = "MEM-NEW-01,Yeni Ürün Modeli,6,250,180,24/28V DC,2800/1200 mm,12,4500,Acil durum katlama|Harici kontrol";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "urun_sablonu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      const newProducts = [];

      // Skip header (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',');
        if (cols.length < 5) continue; // Basic validation

        try {
          const product = {
            id: cols[0].trim(),
            name: cols[1].trim(),
            specs: {
              sections: parseInt(cols[2]) || 0,
              diameter_mm: parseInt(cols[3]) || 0,
              payload_capacity_kg: parseInt(cols[4]) || 0,
              voltage: cols[5]?.trim() || '',
              dimensions_raw: cols[6]?.trim() || '',
              features: cols[9] ? cols[9].split('|').map(f => f.trim()) : []
            },
            base_cost_factors: {
              labor_hours: parseFloat(cols[7]) || 10,
              material_cost: parseFloat(cols[8]) || 0
            }
          };
          newProducts.push(product);
        } catch (err) {
          console.error("Error parsing line:", line, err);
        }
      }

      onImport(newProducts);
      e.target.value = null; // Reset input
    };
    reader.readAsText(file);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const productToAdd = {
      id: newProduct.id,
      name: newProduct.name,
      specs: {
        sections: parseInt(newProduct.specs.sections) || 0,
        diameter_mm: parseInt(newProduct.specs.diameter_mm) || 0,
        payload_capacity_kg: parseInt(newProduct.specs.payload_capacity_kg) || 0,
        voltage: newProduct.specs.voltage,
        dimensions_raw: newProduct.specs.dimensions_raw,
        features: newProduct.specs.features.split(',').map(f => f.trim()).filter(f => f)
      },
      base_cost_factors: {
        labor_hours: parseFloat(newProduct.base_cost_factors.labor_hours) || 0,
        material_cost: parseFloat(newProduct.base_cost_factors.material_cost) || 0
      }
    };
    onImport([productToAdd]);
    setShowAddModal(false);
    setNewProduct({
      id: '',
      name: '',
      specs: { sections: '', diameter_mm: '', payload_capacity_kg: '', voltage: '', dimensions_raw: '', features: '' },
      base_cost_factors: { labor_hours: '', material_cost: '' }
    });
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', background: 'hsl(var(--color-accent))', color: 'black', fontWeight: 'bold' }}
        >
          <Plus size={16} />
          <span>Manuel Ürün Ekle</span>
        </button>
        <button
          onClick={downloadTemplate}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
        >
          <FileDown size={16} />
          <span>Excel Şablonu İndir</span>
        </button>
        <button
          onClick={() => fileInputRef.current.click()}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Upload size={16} />
          <span>Ürünleri Yükle</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv"
          style={{ display: 'none' }}
        />
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '600px', maxHeight: '90vh', overflowY: 'auto', background: '#1e293b' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'hsl(var(--color-accent))' }}>Yeni Ürün Ekle</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ParamInput label="Ürün Kodu *" value={newProduct.id} onChange={(val) => setNewProduct({ ...newProduct, id: val })} type="text" />
                <ParamInput label="Ürün Adı *" value={newProduct.name} onChange={(val) => setNewProduct({ ...newProduct, name: val })} type="text" />
              </div>

              <h4 style={{ margin: '0.5rem 0 0', color: 'hsl(var(--color-text-secondary))', fontSize: '0.9rem' }}>Teknik Özellikler</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ParamInput label="Kesit Sayısı" value={newProduct.specs.sections} onChange={(val) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, sections: val } })} />
                <ParamInput label="Çap (mm)" value={newProduct.specs.diameter_mm} onChange={(val) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, diameter_mm: val } })} />
                <ParamInput label="Yük Kapasitesi (kg)" value={newProduct.specs.payload_capacity_kg} onChange={(val) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, payload_capacity_kg: val } })} />
                <ParamInput label="Voltaj" value={newProduct.specs.voltage} onChange={(val) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, voltage: val } })} type="text" />
                <ParamInput label="Boyutlar" value={newProduct.specs.dimensions_raw} onChange={(val) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, dimensions_raw: val } })} type="text" />
              </div>

              <h4 style={{ margin: '0.5rem 0 0', color: 'hsl(var(--color-text-secondary))', fontSize: '0.9rem' }}>Maliyet Faktörleri</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ParamInput label="İşçilik Saati" value={newProduct.base_cost_factors.labor_hours} onChange={(val) => setNewProduct({ ...newProduct, base_cost_factors: { ...newProduct.base_cost_factors, labor_hours: val } })} />
                <ParamInput label="Malzeme Maliyeti ($)" value={newProduct.base_cost_factors.material_cost} onChange={(val) => setNewProduct({ ...newProduct, base_cost_factors: { ...newProduct.base_cost_factors, material_cost: val } })} />
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'hsl(var(--color-text-secondary))' }}>Özellikler (Virgülle ayırın)</label>
                <input
                  type="text"
                  value={newProduct.specs.features}
                  onChange={(e) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, features: e.target.value } })}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px', color: 'white' }}
                  placeholder="Örn: Acil durum katlama, Harici kontrol"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>İptal</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', background: 'hsl(var(--color-accent))', color: 'black', fontWeight: 'bold' }}>Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {products.map((p, idx) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-panel"
          style={{ padding: '1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ color: 'hsl(var(--color-accent))' }}>{p.name}</h3>
            <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.8rem' }}>
              {p.specs.voltage}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: 'hsl(var(--color-text-secondary))' }}>
            <div>• Kesit Sayısı: <span style={{ color: 'white' }}>{p.specs.sections}</span></div>
            <div>• Çap: <span style={{ color: 'white' }}>{p.specs.diameter_mm}mm</span></div>
            <div>• Yük Kapasitesi: <span style={{ color: 'white' }}>{p.specs.payload_capacity_kg}kg</span></div>
            <div>• Boyutlar: <span style={{ color: 'white' }}>{p.specs.dimensions_raw}</span></div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <strong>Özellikler:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {p.specs.features.map((f, i) => (
                <span key={i} style={{ fontSize: '0.8rem', background: 'rgba(50, 200, 100, 0.1)', color: '#4ade80', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))
      }
    </div >
  );
}

function SettingsView({ params, setParams }) {
  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Varsayılan Maliyet Parametreleri</h2>

      <div style={{ display: 'grid', gap: '2rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'hsl(var(--color-text-secondary))' }}>
            İşçilik Saatlik Ücreti ($/Saat)
          </label>
          <input
            type="number"
            value={params.labor_hourly_rate}
            onChange={(e) => setParams({ ...params, labor_hourly_rate: parseFloat(e.target.value) })}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'hsl(var(--color-text-secondary))' }}>
            Genel Gider Oranı (%)
          </label>
          <input
            type="number"
            value={params.overhead_percentage}
            onChange={(e) => setParams({ ...params, overhead_percentage: parseFloat(e.target.value) })}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'hsl(var(--color-text-secondary))' }}>
            Kar Marjı (%)
          </label>
          <input
            type="number"
            value={params.profit_margin}
            onChange={(e) => setParams({ ...params, profit_margin: parseFloat(e.target.value) })}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'hsl(var(--color-text-secondary))' }}>
            Dolar Kuru (TL)
          </label>
          <input
            type="number"
            value={params.currency_rate}
            onChange={(e) => setParams({ ...params, currency_rate: parseFloat(e.target.value) })}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))' }}>
            💡 Bu parametreler tüm maliyet hesaplamalarında kullanılır. Değişiklikler anında uygulanır.
          </p>
        </div>
      </div>
    </div>
  );
}



function CostingView({ products, selectedProduct, onSelect, calculation, params, setParams, companies, onOpenProposalModal, productCustomizations, setProductCustomizations, basket, onAddToBasket, onRemoveFromBasket, onUpdateBasketItem }) {
  const [quantity, setQuantity] = useState(1);
  const [editingBasketItemId, setEditingBasketItemId] = useState(null);

  const handleBasketItemClick = (item) => {
    setEditingBasketItemId(item.id);
    setQuantity(item.quantity);

    // Update customizations to reflect the item's specific costs
    const newCustomizations = {
      ...productCustomizations,
      [item.product.id]: {
        material_cost: item.calculation.raw_material_cost,
        labor_hours: item.calculation.labor_hours
      }
    };
    setProductCustomizations(newCustomizations);

    // Trigger selection to update middle panel
    // We pass the specific values from the item's calculation
    onSelect(item.product, item.calculation.raw_material_cost, item.calculation.labor_hours);
  };

  const handleAction = () => {
    if (editingBasketItemId) {
      onUpdateBasketItem(editingBasketItemId, selectedProduct, calculation, quantity);
      setEditingBasketItemId(null);
      setQuantity(1);
      alert("Ürün güncellendi!");
    } else {
      onAddToBasket(selectedProduct, calculation, quantity);
      setQuantity(1);
    }
  };

  return (
    <div className="costing-view-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '2rem', height: 'calc(100vh - 140px)' }}>
      {/* Left Panel: Product List */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Ürün Seçimi</h3>
        </div>
        <div style={{ overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {products.map(p => (
            <div
              key={p.id}
              onClick={() => {
                onSelect(p);
                setEditingBasketItemId(null);
                setQuantity(1);
              }}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedProduct?.id === p.id && !editingBasketItemId ? 'hsl(var(--color-accent))' : 'rgba(255,255,255,0.03)',
                border: selectedProduct?.id === p.id && !editingBasketItemId ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                transition: 'all 0.2s',
                color: selectedProduct?.id === p.id && !editingBasketItemId ? 'black' : 'white'
              }}
            >
              <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{p.specs.sections} Kesit, {p.specs.payload_capacity_kg}kg</div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Panel: Details & Calculation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
        {!selectedProduct ? (
          <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-text-muted))', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '3rem', opacity: 0.2 }}>👈</div>
            <p>Lütfen sol taraftan bir ürün seçin.</p>
          </div>
        ) : (
          <>
            {/* Product Header & Inputs */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: 0, color: 'hsl(var(--color-accent))' }}>
                    {selectedProduct.name}
                    {editingBasketItemId && <span style={{ fontSize: '0.8rem', marginLeft: '1rem', background: 'hsl(var(--color-warning))', color: 'black', padding: '0.2rem 0.5rem', borderRadius: '4px', verticalAlign: 'middle' }}>Düzenleniyor</span>}
                  </h2>
                  <p style={{ margin: '0.5rem 0 0 0', color: 'hsl(var(--color-text-secondary))', fontSize: '0.9rem' }}>
                    {selectedProduct.specs.sections} Kesit • {selectedProduct.specs.diameter_mm}mm Çap • {selectedProduct.specs.payload_capacity_kg}kg Kapasite
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))' }}>Ürün Kodu</div>
                  <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{selectedProduct.id}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Material Cost Input */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                    Hammadde ve Malzeme Maliyeti ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productCustomizations[selectedProduct.id]?.material_cost || 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const currentCustomization = productCustomizations[selectedProduct.id] || {};
                      const newCustomization = {
                        ...currentCustomization,
                        material_cost: val
                      };
                      const newCustomizations = {
                        ...productCustomizations,
                        [selectedProduct.id]: newCustomization
                      };
                      setProductCustomizations(newCustomizations);
                      localStorage.setItem('productCustomizations', JSON.stringify(newCustomizations));
                      // Trigger recalculation with new material cost, keeping existing labor hours
                      onSelect(selectedProduct, val, currentCustomization.labor_hours);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}
                    placeholder="0.00"
                  />
                </div>

                {/* Labor Hours Input */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                    İşçilik Saati (Saat)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      step="0.5"
                      value={productCustomizations[selectedProduct.id]?.labor_hours ?? selectedProduct.base_cost_factors.labor_hours}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const currentCustomization = productCustomizations[selectedProduct.id] || {};
                        const newCustomization = {
                          ...currentCustomization,
                          labor_hours: val
                        };
                        const newCustomizations = {
                          ...productCustomizations,
                          [selectedProduct.id]: newCustomization
                        };
                        setProductCustomizations(newCustomizations);
                        localStorage.setItem('productCustomizations', JSON.stringify(newCustomizations));
                        // Trigger recalculation with new labor hours, keeping existing material cost
                        onSelect(selectedProduct, currentCustomization.material_cost, val);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>x ${params.labor_hourly_rate}/saat</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculation Results */}
            {calculation && (
              <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ margin: 0 }}>Fiyat Analizi Raporu</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Quantity Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>Adet:</span>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        style={{ width: '50px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', textAlign: 'center' }}
                      />
                    </div>

                    {/* Add/Update Button */}
                    <button
                      onClick={handleAction}
                      className={editingBasketItemId ? "btn-warning" : "btn-secondary"}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: editingBasketItemId ? 'hsl(var(--color-warning))' : 'rgba(255,255,255,0.1)',
                        color: editingBasketItemId ? 'black' : 'white',
                        border: editingBasketItemId ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      <span>{editingBasketItemId ? '↻' : '🛒'}</span>
                      {editingBasketItemId ? 'Güncelle' : 'Teklife Ekle'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  {/* Costs Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Maliyet Bileşenleri</h4>
                    <CostRow label="Hammadde & Malzeme" value={calculation.raw_material_cost} />
                    <CostRow
                      label={`İşçilik (${calculation.labor_hours} saat)`}
                      value={calculation.labor_cost}
                    />
                    <CostRow label={`Genel Giderler (%${params.overhead_percentage})`} value={calculation.overhead_cost} />
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                      <CostRow label="Toplam Maliyet" value={calculation.total_cost} isTotal />
                    </div>
                  </div>

                  {/* Price Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Satış Fiyatı</h4>
                    <div style={{
                      background: 'rgba(14, 99, 156, 0.1)',
                      border: '1px solid rgba(14, 99, 156, 0.3)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-secondary))', marginBottom: '0.5rem' }}>Önerilen Satış Fiyatı</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'hsl(var(--color-accent))', lineHeight: 1 }}>
                        ${calculation.suggested_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '1.1rem', color: 'hsl(var(--color-text-muted))', marginTop: '0.5rem' }}>
                        ₺{calculation.price_try.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>Kar Marjı</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>%{params.profit_margin}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>Dolar Kuru</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₺{params.currency_rate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Panel: Basket Summary */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ overflowY: 'auto', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {basket && basket.length > 0 ? (
            basket.map((item) => (
              <div
                key={item.id}
                onClick={() => handleBasketItemClick(item)}
                style={{
                  background: editingBasketItemId === item.id ? 'hsl(var(--color-accent))' : 'rgba(255,255,255,0.03)',
                  color: editingBasketItemId === item.id ? 'black' : 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: editingBasketItemId === item.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.product.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent item selection when deleting
                      onRemoveFromBasket(item.id);
                      if (editingBasketItemId === item.id) {
                        setEditingBasketItemId(null);
                        setQuantity(1);
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: editingBasketItemId === item.id ? 'black' : '#ef4444', cursor: 'pointer', padding: 0 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: editingBasketItemId === item.id ? 'rgba(0,0,0,0.7)' : 'hsl(var(--color-text-secondary))' }}>
                  <span>{item.quantity} Adet x ${item.calculation.suggested_price.toLocaleString()}</span>
                  <span style={{ fontWeight: 'bold' }}>${(item.quantity * item.calculation.suggested_price).toLocaleString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'hsl(var(--color-text-muted))', marginTop: '2rem' }}>
              Sepet boş
            </div>
          )}
        </div>
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={onOpenProposalModal}
            className="btn-warning"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
            disabled={!basket || basket.length === 0}
          >
            <span>📋</span> Teklifi Tamamla
          </button>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: active ? 'hsl(var(--color-accent) / 0.1)' : 'transparent',
        color: active ? 'hsl(var(--color-accent))' : 'hsl(var(--color-text-secondary))',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}>
      {icon}
      <span style={{ fontWeight: 500 }}>{label}</span>
      {active && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
    </div>
  );
}

function StatCard({ title, value, trend }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ color: 'hsl(var(--color-text-secondary))', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</span>
        <span style={{ color: 'hsl(var(--color-accent))', fontSize: '0.875rem' }}>{trend}</span>
      </div>
    </div>
  );
}

function ParamInput({ label, value, onChange, type = "number" }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'hsl(var(--color-text-secondary))' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) : e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '0.5rem',
          borderRadius: '4px',
          color: 'white'
        }}
      />
    </div>
  );
}

function CostRow({ label, value, isTotal }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: isTotal ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
      <span style={{ color: isTotal ? 'white' : 'hsl(var(--color-text-secondary))', fontWeight: isTotal ? 'bold' : 'normal' }}>{label}</span>
      <span style={{ fontWeight: 'bold', fontSize: isTotal ? '1.2rem' : '1rem' }}>${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  );
}

function RequirementsView() {
  return (
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--color-text-muted))' }}>
      <h3>Gereksinimler Modülü</h3>
      <p>Bu modül henüz yapım aşamasındadır.</p>
    </div>
  );
}

export default App;
