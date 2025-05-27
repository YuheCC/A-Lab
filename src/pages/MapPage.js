import Sidebar from "../components/Sidebar";
import UMAPClusterPlot from "../components/UMAPClusterPlot";
import { useState } from "react";

const MapPage = ({ data, activePage, handleNavigation, userPermissions, handlePointClick, loading, error }) => {

    const [showMapFooter, setShowMapFooter] = useState(true);

    return (
        <Sidebar activePage={activePage} handleNavigation={handleNavigation}>
            {/* UMAP Visualization in the middle (50%) */}
            <div className="search-umap-container">
                {/* UMAP Visualization in the middle (50%) */}
                <div className="search-umap-section">
                    <div className="graph-container search-graph">
                        {data.length > 0 ? (
                            <UMAPClusterPlot
                                data={data}
                                userPermissions={userPermissions}
                                onClick={handlePointClick}
                            />
                        ) : (
                            <div className="loading-message">
                                {loading ? 'Loading Map of the Molecular Universe' : error ? 'Error loading data' : 'No data available'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right text content */}
                <div className="search-interface-section" style={{ flex: '0.8', overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', height: 'calc(100vh - 250px)', overflow: 'scroll' }}>
                    <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>About Molecular Universe</h2>
                    <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                        Molecular Universe MU-0 is a battery material discovery software and service platform. We mapped more battery relevant properties of more battery relevant small molecules than ever before and trained a navigation system powered by a battery-specific llm that's like having world-renowned battery scientists at your fingertips. Now we can offer different levels of joint development services to customers across Li-Metal, silicon Li-ion, LFP, and many others.
                    </p>

                    <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                        This 2D map visualizes a 512 dimensional universe of small molecules through a dimension reduction algorithm called UMAP (Uniform Manifold Approximation and Projection). It's the world's largest database of battery relevant molecules and properties that we know of, and constantly growing. Users can interact, filter, search and ask questions in natural language to accelerate their next generation battery development.
                    </p>

                    <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                        In MU-0, the map consists of 23 molecular clusters, they are labeled as below. We will be updating this map as we explore deeper into the Molecular Universe.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', marginTop: '10px' }}>
                        <img loading="lazy" src="/MU_About_Cluster_Numbered.jpg"
                            alt="Molecular Universe Clusters Map"
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                            }} />
                    </div>

                    <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>Cluster Descriptions</h3>
                    <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 1:</strong> Outlier cluster, "catch all"</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 2:</strong> Largely populated by molecules with carbonyl functionalities and monocyclic aromatic structure.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 3:</strong> Largely populated by molecules with sulfone functionalities and monocyclic aromatic structure.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 4:</strong> Largely populated by molecules with polycyclic and heteroatom aromatics.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 5:</strong> Largely populated by molecules with polycyclic heteroatom aromatics and carbonyl functionalities.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 6:</strong> Largely populated by molecules with polycyclic heteroatom aromatics and carbonyl functionalities.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 7:</strong> Largely populated by monocyclic molecules containing double-bonded N or O atoms.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 8:</strong> Largely populated by linear molecules containing O and N atoms.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 9:</strong> Largely populated by non-aromatic monocyclic sulfones</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 10:</strong> Largely populated by linear molecules with sulfone, ethereal and carbonyl functionalities (most linear ethers are here)</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 11:</strong> Largely populated by monocyclic, non-aromatic molecules with carbonyl functionalities (most carbonate esters are here)</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 12:</strong> Largely populated by polycyclic fused ring aromatic molecules</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 13:</strong> Largely populated by polycyclic fused aromatic + non-aromatic molecules (some cyclic ethers are here)</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 14:</strong> Largely populated by polycyclic fused aromatic + non-aromatic molecules</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 15:</strong> Largely populated by polycyclic fused aromatic + non-aromatic molecules</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 16:</strong> Largely populated by polycyclic molecules with a mix of co-occurring aromatic & non-aromatic molecules</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 17:</strong> Largely populated by polycyclic fused aromatic + non-aromatic molecules containing more than 2 rings</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 18:</strong> Largely populated by polycyclic molecules with a mix of co-occurring aromatic & non-aromatic rings</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 19:</strong> Largely populated by polycyclic molecules with a mix of co-occurring aromatic & non-aromatic rings</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 20:</strong> Largely populated by monocyclic non-aromatic molecules with no double bonds and long chain functional groups</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 21:</strong> Largely populated by monocyclic non-aromatic molecules with carbonyl functional groups</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 22:</strong> Largely populated by non-aromatic polycyclic molecules</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 23:</strong> Largely populated by non-aromatic polycyclic molecules</p>
                    </div>
                </div>
            </div>
            {showMapFooter && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    fontSize: '14px',
                    color: '#333',
                    textAlign: 'center',
                    padding: '10px 0',
                    backgroundColor: '#f1f1f1'
                }}>
                    <button
                        onClick={() => setShowMapFooter(false)}
                        style={{
                            position: 'absolute',
                            top: '5px',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            fontSize: '16px',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '0',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Close this panel"
                    >
                        ×
                    </button>
                    By using Molecular Universe, you agree to our <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('terms'); }} style={{ color: '#0066cc', textDecoration: 'underline' }}>Terms and Privacy Policy.</a>
                    <p style={{ fontSize: '10.5px', marginTop: '8px', marginBottom: '0' }}>
                        This interactive UMAP runs best on devices from 2019 or newer with at least 8 GB RAM and a modern processor (e.g. Apple M1+, Intel i5+), as older or lower-end systems may experience lag or loading issues. <br></br>
                        Molecule Renderer (Smiles Drawer, Daniel Probst et. al): <a href="https://pubs.acs.org/doi/10.1021/acs.jcim.7b00425">10.1021/acs.jcim.7b00425</a>
                    </p>
                </div>
            )}
        </Sidebar>
    )
};

export default MapPage;