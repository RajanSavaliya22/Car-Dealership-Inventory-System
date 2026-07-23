import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as vehiclesApi from "../api/vehicles";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import VehicleForm from "../components/admin/VehicleForm";
import bmwImage from "./assets/bmw-removebg-preview.png";
import porscheImage from "./assets/Porsche-911-GT3-RS-PNG-Free-File-Download.png";

export default function LandingPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterMake, setFilterMake] = useState("");
    const [filterModel, setFilterModel] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const [filterMinPrice, setFilterMinPrice] = useState("");
    const [filterMaxPrice, setFilterMaxPrice] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [authModalType, setAuthModalType] = useState(null);
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showAllCars, setShowAllCars] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const sliderRef = useRef(null);

    const [adminMode, setAdminMode] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [restockAmount, setRestockAmount] = useState(1);

    const scrollSlider = (direction) => {
        if (sliderRef.current) {
            const cardWidth = 360; // 320px width + 40px gap
            sliderRef.current.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
        }
    };

    // Auto-scroll animation loop for horizontal vehicle cards (discrete steps)
    useEffect(() => {
        const interval = setInterval(() => {
            const slider = sliderRef.current;
            if (slider && slider.dataset.hovered !== "true") {
                // Determine if there is content overflowing
                if (slider.scrollWidth > slider.clientWidth) {
                    if (slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 10) {
                        scrollSlider(1);
                    }
                    // Stops at right-most, no infinite loop resets.
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user) {
            setAuthModalType(null); // automatically close login popup if user logged in
        } else {
            setShowOrders(false);
        }
    }, [user]);

    useEffect(() => {
        if (showOrders) {
            vehiclesApi.fetchTransactions().then(data => setTransactions(data || []));
        }
    }, [showOrders]);

    useEffect(() => {
        let isCurrent = true;
        vehiclesApi.fetchVehicles()
            .then((data) => {
                if (isCurrent) setVehicles(data.results || []);
            })
            .catch(() => {
                if (isCurrent) setError("Unable to load vehicles.");
            })
            .finally(() => {
                if (isCurrent) setLoading(false);
            });
        return () => { isCurrent = false; };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((curr) => (curr === 0 ? 1 : 0));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    function handleEnquire(vehicle) {
        if (user) {
            setSelectedVehicle(vehicle);
        } else {
            setAuthModalType('login');
        }
    }

    function handleOrder() {
        if (!selectedVehicle) return;
        setPurchasing(true);
        setPurchaseError(null);
        vehiclesApi.purchaseVehicle(selectedVehicle.id)
            .then(() => {
                setVehicles((current) =>
                    current.map((v) =>
                        v.id === selectedVehicle.id ? { ...v, quantity: v.quantity - 1 } : v
                    )
                );
                setNotification({
                    type: 'success',
                    title: 'Order Confirmed',
                    message: `Your reservation for the ${selectedVehicle.make} ${selectedVehicle.model} was successful. Our team will contact you shortly to finalize.`
                });
                setSelectedVehicle(null);
            })
            .catch((err) => {
                const detail = err?.response?.data?.detail;
                const message = Array.isArray(detail) ? detail[0] : detail || "Unable to order.";
                setNotification({
                    type: 'error',
                    title: 'Order Unsuccessful',
                    message: message
                });
            })
            .finally(() => {
                setPurchasing(false);
            });
    }

    const handleAdminDelete = async () => {
        if (!selectedVehicle) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedVehicle.make} ${selectedVehicle.model}?`)) return;
        try {
            setPurchasing(true);
            await vehiclesApi.deleteVehicle(selectedVehicle.id);
            setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id));
            setSelectedVehicle(null);
        } catch (err) {
            setPurchaseError('Failed to delete vehicle.');
        } finally {
            setPurchasing(false);
        }
    };

    const handleAdminRestock = async () => {
        if (!selectedVehicle) return;
        try {
            setPurchasing(true);
            await vehiclesApi.restockVehicle(selectedVehicle.id, restockAmount);
            const updated = { ...selectedVehicle, quantity: selectedVehicle.quantity + restockAmount };
            setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
            setSelectedVehicle(updated);
        } catch (err) {
            setPurchaseError('Failed to restock vehicle.');
        } finally {
            setPurchasing(false);
        }
    };
    const slides = [
        {
            title: "Premium Vehicles",
            desc: "Discover the most prestigious collection of luxury performance vehicles on the market today.",
            img: bmwImage,
        },
        {
            title: "Redefining Luxury",
            desc: "Uncompromising engineering meets breathtaking design. Find the ride of your dreams.",
            img: porscheImage,
        }
    ];

    return (
        <div style={{ background: 'var(--bg-color)' }}>
            {/* Navigation Header */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.8rem 3rem', background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--surface-border)'
            }}>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)', letterSpacing: '-0.02em', transition: 'color 0.3s' }}>
                    AUTO<span style={{ color: 'var(--text-muted)' }}>ELITE</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <button
                                onClick={() => setShowOrders(true)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '0.6rem 1.5rem', fontWeight: 600, whiteSpace: 'nowrap', width: 'auto' }}>
                                View Orders
                            </button>
                            <button
                                onClick={logout}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '0.6rem 1.5rem', fontWeight: 600, whiteSpace: 'nowrap', width: 'auto' }}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setAuthModalType('login')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '0.6rem 1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', transition: 'color 0.3s', whiteSpace: 'nowrap', width: 'auto' }}>
                                Log In
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => setAuthModalType('register')}
                                style={{ padding: '0.6rem 1.75rem', borderRadius: '50px', whiteSpace: 'nowrap', width: 'auto', flex: '0 0 auto' }}>
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Time-based Animated Hero Section */}
            <div style={{ position: 'relative', height: '100vh', background: 'var(--bg-color)', overflow: 'hidden' }}>

                {slides.map((slide, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <div key={index} style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', width: '100%', padding: '0 5%',
                            pointerEvents: isActive ? 'auto' : 'none'
                        }}>
                            {/* Left Column Text */}
                            <div style={{
                                flex: '0 0 45%', paddingLeft: '3%',
                                transform: isActive ? 'translateX(0)' : 'translateX(-100vw)',
                                transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <h1 style={{ fontSize: '4.5rem', color: 'var(--text-main)', fontWeight: '800', lineHeight: 1.1 }}>
                                    {slide.title}
                                </h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '1rem', maxWidth: '400px' }}>
                                    {slide.desc}
                                </p>
                            </div>

                            {/* Right Column Image */}
                            <div style={{
                                flex: '0 0 55%', display: 'flex', justifyContent: 'center',
                                transform: isActive ? 'translateX(0)' : 'translateX(100vw)',
                                transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <img src={slide.img} alt={slide.title} style={{ width: '130%', maxWidth: '900px', objectFit: 'contain' }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content (Inventory) */}
            <div className="app-container" style={{ position: 'relative', zIndex: 10, background: 'var(--bg-color)', paddingTop: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 800 }}>Available Models</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Discover our prestigious collection currently available for order.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button onClick={() => scrollSlider(-1)} style={{ flex: '0 0 52px', width: '52px', height: '52px', borderRadius: '50%', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button onClick={() => scrollSlider(1)} style={{ flex: '0 0 52px', width: '52px', height: '52px', borderRadius: '50%', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                        {!(user?.is_admin || user?.role === 'admin' || user?.is_staff) && (
                            <button onClick={() => setShowAllCars(true)} className="btn-primary" style={{ padding: '0.9rem 2.5rem', borderRadius: '50px', marginLeft: '0.5rem', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.02em', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)' }}>See All</button>
                        )}
                        {(user?.is_admin || user?.role === 'admin' || user?.is_staff) && (
                            <button onClick={() => { setAdminMode(true); setShowAllCars(true); }} className="btn-secondary" style={{ padding: '0.9rem 1.75rem', borderRadius: '50px', fontWeight: 600, fontSize: '1rem' }}>Manage Vehicles</button>
                        )}
                    </div>
                </div>

                {loading && <p style={{ textAlign: 'center', margin: '4rem 0', color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>Loading exclusive collection...</p>}
                {error && <p className="alert-error text-center">{error}</p>}

                {!loading && !error && (
                    <div
                        ref={sliderRef}
                        onMouseEnter={() => { if (sliderRef.current) sliderRef.current.dataset.hovered = "true" }}
                        onMouseLeave={() => { if (sliderRef.current) sliderRef.current.dataset.hovered = "false" }}
                        style={{
                            display: 'flex',
                            gap: '2.5rem',
                            overflowX: 'auto',
                            paddingBottom: '2rem',
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none' // Firefox
                        }}
                        className="hide-scrollbar"
                    >
                        {vehicles.map((vehicle) => (
                            <article key={vehicle.id} style={{
                                flex: '0 0 320px', // Fixed width for horizontal scrolling cards
                                background: 'var(--surface-color)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: 'translateY(0)', // establish stacking context
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.03)';
                                    e.currentTarget.style.borderColor = 'var(--surface-border)';
                                }}
                            >
                                <div style={{ aspectRatio: '16/9', backgroundColor: 'var(--secondary-color)', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                        src={vehicle.image_url || `https://images.unsplash.com/photo-1549317661-bc32c0734c89?auto=format&fit=crop&w=400&q=80&sig=${vehicle.id}`}
                                        alt={`${vehicle.make} ${vehicle.model}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                </div>
                                <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{vehicle.make}</span>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{vehicle.model}</h3>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', background: 'var(--surface-color)', border: '1px solid var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 600 }}>{vehicle.category}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEnquire(vehicle)}
                                        className="btn-primary"
                                        style={{ marginTop: 'auto', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                                    >
                                        Inquire
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Footer */}
            <footer style={{
                background: '#0a0a0a',
                color: '#f8fafc',
                padding: '5rem 5% 3rem',
                borderTop: '1px solid #1e293b',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', justifyContent: 'space-between' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', color: '#ffffff' }}>
                            AUTO<span style={{ color: '#94a3b8' }}>ELITE</span>
                        </h3>
                        <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '1rem', maxWidth: '350px' }}>
                            Setting the standard in luxury automotive retail. Explore the most prestigious collection of performance vehicles delivered with unparalleled service.
                        </p>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Showroom</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>New Arrivals</a></li>
                            <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Pre-Owned</a></li>
                            <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Special Offers</a></li>
                            <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Financing</a></li>
                        </ul>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Contact Us</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#94a3b8' }}>
                            <li>1-800-ELITE-AUTO</li>
                            <li>sales@autoelite.com</li>
                            <li style={{ marginTop: '0.5rem', lineHeight: 1.5 }}>
                                100 Prestige Boulevard<br />Beverly Hills, CA 90210
                            </li>
                        </ul>
                    </div>
                </div>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    borderTop: '1px solid #1e293b',
                    marginTop: '4rem', paddingTop: '2rem',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', color: '#64748b', fontSize: '0.9rem', flexWrap: 'wrap', gap: '1rem'
                }}>
                    <p>&copy; {new Date().getFullYear()} AutoElite Dealerships. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
                    </div>
                </div>
            </footer>

            {/* Modal for Logged In Users -> Car Details */}
            {selectedVehicle && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 3000,
                    background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', animation: 'fadeIn 0.3s ease-out'
                }} onClick={() => setSelectedVehicle(null)}>
                    <div style={{
                        background: 'var(--bg-color)',
                        borderRadius: '24px', maxWidth: '1000px', width: '100%', maxHeight: '90vh',
                        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255,255,255,1)',
                        display: 'flex', flexDirection: 'row', overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>

                        {/* Left Column: Full Image */}
                        <div style={{ flex: '1 1 55%', backgroundColor: 'var(--secondary-color)', position: 'relative' }}>
                            <img
                                src={selectedVehicle.image_url || `https://images.unsplash.com/photo-1549317661-bc32c0734c89?auto=format&fit=crop&w=800&q=80&sig=${selectedVehicle.id}`}
                                alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                            />
                        </div>

                        {/* Right Column: Details */}
                        <div className="see-all-scroll" style={{ flex: '1 1 45%', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto' }}>
                            <button onClick={() => setSelectedVehicle(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-color)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-color)'}>✕</button>

                            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{selectedVehicle.make}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                                <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', paddingRight: '2rem' }}>{selectedVehicle.model}</h2>
                                <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontWeight: 600 }}>{selectedVehicle.category}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500, marginBottom: '1.5rem' }}>{selectedVehicle.year}</p>

                            <p style={{ color: 'var(--primary-color)', fontSize: '2rem', fontWeight: 800, margin: '0 0 1.5rem 0' }}>
                                ${Number(selectedVehicle.price).toLocaleString()}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Availability</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: selectedVehicle.quantity > 0 ? '#10b981' : '#ef4444' }}>
                                        {selectedVehicle.quantity > 0 ? `${selectedVehicle.quantity} in stock` : 'Out of Stock'}
                                    </span>
                                </div>
                                <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Vehicle ID</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                        #{selectedVehicle.id}
                                    </span>
                                </div>
                            </div>

                            {selectedVehicle.description && (
                                <div style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>Description</p>
                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)' }}>{selectedVehicle.description}</p>
                                </div>
                            )}

                            <div style={{ flexGrow: 1 }}></div>

                            {purchaseError && <p className="alert-error" style={{ marginBottom: '1rem' }}>{purchaseError}</p>}

                            {adminMode ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
                                        <input
                                            type="number"
                                            value={restockAmount}
                                            min="1"
                                            onChange={e => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                            style={{ width: '80px', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--surface-border)', background: 'var(--surface-color)', color: 'var(--text-main)', textAlign: 'center', fontWeight: 'bold' }}
                                        />
                                        <button
                                            onClick={handleAdminRestock}
                                            className="btn-primary"
                                            style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', fontWeight: 600 }}
                                            disabled={purchasing}
                                        >
                                            {purchasing ? 'Processing...' : 'Restock'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAdminDelete}
                                        className="btn-secondary"
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', fontWeight: 600, color: '#ef4444', borderColor: '#ef4444', backgroundColor: 'transparent' }}
                                        disabled={purchasing}
                                    >
                                        Delete Vehicle
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => setSelectedVehicle(null)}
                                        className="btn-secondary"
                                        style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', fontWeight: 600 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleOrder}
                                        className="btn-primary"
                                        style={{ flex: 2, padding: '0.85rem', borderRadius: '12px', fontWeight: 600 }}
                                        disabled={purchasing || selectedVehicle.quantity === 0}
                                    >
                                        {purchasing ? 'Processing...' : (selectedVehicle.quantity === 0 ? 'Out of Stock' : 'Confirm Order')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Unauthenticated Users -> Login/Register */}
            {authModalType && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                }} onClick={() => setAuthModalType(null)}>
                    <div style={{
                        background: 'var(--surface-color)', padding: '2rem',
                        borderRadius: '24px', maxWidth: '420px', width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setAuthModalType(null)}
                            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>
                            ✕
                        </button>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {authModalType === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {authModalType === 'login' ? 'Log in to inquire about premium vehicles.' : 'Sign up to reserve a vehicle.'}
                            </p>
                        </div>
                        {authModalType === 'login' ? <LoginForm onSuccess={() => setAuthModalType(null)} /> : <RegisterForm onSuccess={() => setAuthModalType('login')} />}
                        <div style={{ marginTop: '1.25rem', textAlign: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '1.25rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                {authModalType === 'login' ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => setAuthModalType(authModalType === 'login' ? 'register' : 'login')}
                                    style={{ background: 'none', color: 'var(--primary-color)', fontWeight: 700, border: 'none', padding: 0, cursor: 'pointer', marginLeft: '0.25rem' }}>
                                    {authModalType === 'login' ? 'Sign up now' : 'Log in here'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal for "See More" Full Inventory */}
            {showAllCars && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2.5rem', animation: 'fadeIn 0.3s ease-out'
                }} onClick={() => setShowAllCars(false)}>
                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                        .see-all-scroll::-webkit-scrollbar { width: 8px; }
                        .see-all-scroll::-webkit-scrollbar-track { background: transparent; }
                        .see-all-scroll::-webkit-scrollbar-thumb { background: var(--surface-border); border-radius: 4px; }
                        .see-all-scroll::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
                    `}</style>
                    <div style={{
                        background: 'var(--bg-color)', borderRadius: '32px',
                        width: '100%', height: '100%', maxWidth: '1600px', maxHeight: '92vh',
                        display: 'flex', overflow: 'hidden',
                        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255,255,255,1)'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Left Panel: Filters */}
                        <div className="see-all-scroll" style={{ width: '300px', background: 'var(--surface-color)', padding: '1.5rem', borderRight: '1px solid var(--surface-border)', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>Filters</h3>
                                <button onClick={() => { setFilterCategory(""); setFilterYear(""); setFilterMaxPrice(""); setFilterMake(""); setFilterModel("") }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Reset</button>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>Category</label>
                                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', cursor: 'pointer', outline: 'none', fontSize: '0.9rem', transition: 'border-color 0.3s' }} onFocus={e => e.target.style.borderColor = 'var(--primary-color)'} onBlur={e => e.target.style.borderColor = 'var(--surface-border)'}>
                                    <option value="">All Categories</option>
                                    {[...new Set(vehicles.map(v => v.category))].filter(Boolean).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>Model Year</label>
                                <input type="number" placeholder="e.g. 2024" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', transition: 'border-color 0.3s' }} onFocus={e => e.target.style.borderColor = 'var(--primary-color)'} onBlur={e => e.target.style.borderColor = 'var(--surface-border)'} />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.25rem', padding: '1.25rem 1rem', background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>Maximum Price</span>
                                    <span style={{ color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 800 }}>${Number(filterMaxPrice || 500000).toLocaleString()}</span>
                                </label>
                                <input type="range" min="0" max="500000" step="5000" value={filterMaxPrice || 500000} onChange={e => setFilterMaxPrice(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}><span>$0</span><span>$500k+</span></div>
                            </div>
                        </div>

                        {/* Right Panel: Content */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', position: 'relative' }}>
                            {/* Top Bar: Make & Model */}
                            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', gap: '1.25rem', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
                                <div style={{ flex: 1, display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1 1 200px', position: 'relative' }}>
                                        <svg style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                        <input type="text" placeholder="Search Make..." value={filterMake} onChange={e => { setFilterMake(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '0.65rem 1.25rem 0.65rem 2.5rem', borderRadius: '40px', border: '1px solid var(--surface-border)', background: 'var(--surface-color)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} onFocus={e => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.boxShadow = '0 4px 12px rgba(99,102,241,0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }} />
                                    </div>
                                    <div style={{ flex: '1 1 200px', position: 'relative' }}>
                                        <svg style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16" /><path d="M4 15h16" /><path d="M10 3L8 21" /><path d="M16 3l-2 18" /></svg>
                                        <input type="text" placeholder="Search Model..." value={filterModel} onChange={e => { setFilterModel(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '0.65rem 1.25rem 0.65rem 2.5rem', borderRadius: '40px', border: '1px solid var(--surface-border)', background: 'var(--surface-color)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} onFocus={e => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.boxShadow = '0 4px 12px rgba(99,102,241,0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }} />
                                    </div>
                                </div>
                                {adminMode && (
                                    <button onClick={() => { setEditingVehicle(null); setShowAddForm(true); }} className="btn-primary" style={{ padding: '0.65rem 1.75rem', borderRadius: '40px', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', width: 'auto', flex: '0 0 auto' }}>+ Add Vehicle</button>
                                )}
                                <button onClick={() => { setShowAllCars(false); setAdminMode(false); }} style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '50%', flex: '0 0 40px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-main)', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'var(--text-main)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--surface-color)'; e.currentTarget.style.color = 'var(--text-main)'; }}>✕</button>
                            </div>

                            {/* Grid */}
                            <div className="see-all-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '2rem' }}>
                                    {(function () {
                                        const filteredVehicles = vehicles.filter(v => {
                                            if (filterMake && !(v.make || "").toLowerCase().includes(filterMake.toLowerCase())) return false;
                                            if (filterModel && !(v.model || "").toLowerCase().includes(filterModel.toLowerCase())) return false;
                                            if (filterYear && (v.year || "").toString() !== filterYear) return false;
                                            if (filterCategory && !(v.category || "").toLowerCase().includes(filterCategory.toLowerCase())) return false;
                                            if (filterMaxPrice && parseFloat(v.price || 0) > parseFloat(filterMaxPrice)) return false;
                                            return true;
                                        });
                                        const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
                                        const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                                        return (
                                            <>
                                                {paginatedVehicles.map((vehicle) => (
                                                    <article key={vehicle.id} style={{
                                                        background: 'var(--surface-color)',
                                                        border: '1px solid var(--surface-border)',
                                                        borderRadius: '24px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-6px)';
                                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)';
                                                            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                                                            e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.03)';
                                                            e.currentTarget.style.borderColor = 'var(--surface-border)';
                                                            e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                                                        }}
                                                        onClick={() => handleEnquire(vehicle)}
                                                    >
                                                        <div style={{ aspectRatio: '16/9', backgroundColor: 'var(--secondary-color)', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <img
                                                                src={vehicle.image_url || `https://images.unsplash.com/photo-1549317661-bc32c0734c89?auto=format&fit=crop&w=400&q=80&sig=${vehicle.id}`}
                                                                alt={`${vehicle.make} ${vehicle.model}`}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                                            />
                                                        </div>
                                                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{vehicle.make}</span>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <h4 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{vehicle.model}</h4>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '0.15rem 0.5rem', borderRadius: '50px', fontWeight: 600, marginTop: '2px' }}>{vehicle.category}</span>
                                                            </div>
                                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, fontWeight: 500, marginBottom: '1rem' }}>{vehicle.year}</p>
                                                            {adminMode ? (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setEditingVehicle(vehicle); setShowAddForm(true); }}
                                                                    className="btn-secondary"
                                                                    style={{ marginTop: 'auto', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                                                                >
                                                                    Edit Vehicle
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleEnquire(vehicle); }}
                                                                    className="btn-primary"
                                                                    style={{ marginTop: 'auto', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                                                                >
                                                                    Inquire
                                                                </button>
                                                            )}
                                                        </div>
                                                    </article>
                                                ))}
                                                {paginatedVehicles.length === 0 && (
                                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                                                        <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>No vehicles match your criteria.</p>
                                                    </div>
                                                )}
                                                {/* Pagination Controls */}
                                                {totalPages > 1 && (
                                                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                                        <button
                                                            onClick={e => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                                            disabled={currentPage === 1}
                                                            className="btn-secondary"
                                                            style={{ padding: '0.6rem 1.25rem', borderRadius: '50px', fontWeight: 600, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                                        >
                                                            Previous
                                                        </button>
                                                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                                            Page {currentPage} of {totalPages}
                                                        </span>
                                                        <button
                                                            onClick={e => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                                                            disabled={currentPage === totalPages}
                                                            className="btn-secondary"
                                                            style={{ padding: '0.6rem 1.25rem', borderRadius: '50px', fontWeight: 600, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Vehicle Modal (Admin) */}
            {adminMode && showAddForm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 4000,
                    background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{
                        background: 'var(--bg-color)',
                        borderRadius: '24px', maxWidth: '800px', width: '100%', maxHeight: '90vh',
                        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255,255,255,1)',
                        display: 'flex', flexDirection: 'column', overflowY: 'auto'
                    }} className="see-all-scroll">
                        <div style={{ padding: '2rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 10 }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h2>
                            <button onClick={() => { setShowAddForm(false); setEditingVehicle(null); }} style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>✕</button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <VehicleForm
                                hideTitle={true}
                                initialValues={editingVehicle}
                                onCancel={() => { setShowAddForm(false); setEditingVehicle(null); }}
                                onSubmit={async (values) => {
                                    setPurchasing(true); // Reusing creating state
                                    try {
                                        if (editingVehicle) {
                                            const updated = await vehiclesApi.updateVehicle(editingVehicle.id, values);
                                            setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
                                        } else {
                                            const newVehicle = await vehiclesApi.createVehicle(values);
                                            setVehicles(prev => [...prev, newVehicle]);
                                        }
                                        setShowAddForm(false);
                                        setEditingVehicle(null);
                                    } catch (err) {
                                        setPurchaseError(editingVehicle ? 'Failed to update vehicle.' : 'Failed to create vehicle.');
                                    } finally {
                                        setPurchasing(false);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Notification Modal */}
            {notification && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999, // Super high to ensure it's on top of everything
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: 'var(--surface-color)',
                        borderRadius: '24px',
                        padding: '2.5rem 2rem',
                        maxWidth: '400px', width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--surface-border)',
                        textAlign: 'center',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: notification.type === 'success' ? '#10b98120' : '#ef444420',
                            color: notification.type === 'success' ? '#10b981' : '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
                        }}>
                            {notification.type === 'success' ? (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            )}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                            {notification.title}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
                            {notification.message}
                        </p>
                        <button
                            onClick={() => setNotification(null)}
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', fontWeight: 600, fontSize: '1rem' }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
            {/* Orders Modal */}
            {showOrders && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 5000,
                    background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2.5rem', animation: 'fadeIn 0.3s ease-out'
                }} onClick={() => setShowOrders(false)}>
                    <div style={{
                        background: 'var(--bg-color)', borderRadius: '32px',
                        width: '100%', maxWidth: '1000px', maxHeight: '92vh',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.5)',
                        border: '1px solid var(--surface-border)',
                        overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)' }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Orders & Transactions</h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>{user?.is_admin ? "All platform transactions" : "Your personal purchase history"}</p>
                            </div>
                            <button onClick={() => setShowOrders(false)} style={{ background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-main)', transition: 'all 0.3s' }}>✕</button>
                        </div>
                        <div className="see-all-scroll" style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
                            {transactions.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '2rem' }}>No orders found.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
                                            <th style={{ padding: '1rem', fontWeight: 600 }}>Vehicle</th>
                                            <th style={{ padding: '1rem', fontWeight: 600 }}>Type</th>
                                            <th style={{ padding: '1rem', fontWeight: 600 }}>User</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(txn => (
                                            <tr key={txn.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-color)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>{new Date(txn.created_at).toLocaleDateString()}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{txn.vehicle_model}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{txn.vehicle_make}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, background: txn.transaction_type === 'PURCHASE' ? '#10b98120' : '#3b82f620', color: txn.transaction_type === 'PURCHASE' ? '#10b981' : '#3b82f6' }}>
                                                        {txn.transaction_type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem' }}>{txn.user_name || 'N/A'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{txn.user_email || ''}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

