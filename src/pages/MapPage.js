import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { usePlotDataStore } from "../providers/plotData";
import { NavLink } from "react-router";
import { useAuthStore } from "../providers/auth";
import UMAPClusterPlotDeck from "../components/UMAPClusterPlotDeck";

const MapPage = ({ handlePointClick }) => {

    const userPermissions = useAuthStore(state => state.userPermissions);

    const { data, loading, error } = usePlotDataStore(); 

    const [showMapFooter, setShowMapFooter] = useState(true);

    return (
        <Sidebar>
            {/* UMAP Visualization in the middle (50%) */}
            <div className="search-umap-container">
                {/* UMAP Visualization in the middle (50%) */}
                <div className="search-umap-section">
                    <div className="graph-container search-graph">
                        {data.length > 0 ? (
                            <UMAPClusterPlotDeck
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
                        <picture>
                            <source srcSet="/MU05_Cluster_Numbered.webp" type="image/webp" />
                            <img
                                loading="lazy"
                                src="/MU05_Cluster_Numbered.png"
                                alt="Molecular Universe 0.5 Clusters Map"
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </picture>
                    </div>

                    <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>Cluster Descriptions</h3>
                    <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 0:</strong> is characterized by Sulfone, Alkyne, NitroSulfonylFluoride functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 1:</strong> is characterized by Heterocyclic-P-CO-1, Amide, Amine functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 2:</strong> is characterized by Heterocyclic-P-CS-1, Amide, Amine functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 3:</strong> is characterized by FluoroSulfonyl, Sulfone, Alkene functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 4:</strong> is characterized by Ether, Heterocyclic-P-CN-2, Thioketone functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 5:</strong> is characterized by Pyridine, Ketone, Thioketone functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 6:</strong> is characterized by Heterocyclic-P-CS-1, Amide, Amine functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 7:</strong> is characterized by Heterocyclic-P-CO-1, Amide, Thioamide functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 8:</strong> is characterized by Sulfone, Amide, FluoroSulfonyl functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 9:</strong> is characterized by Amino carbonyl, Imide, Amine functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 10:</strong> is characterized by Amine, Ether, Ketal functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 11:</strong> is characterized by Arene, Amide, Halogen functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 12:</strong> is characterized by Arene, Ketal, Ether functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 13:</strong> is characterized by Amide, Amine, Heterocyclic-P-CO-1 functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 14:</strong> is characterized by Amide, Amine, Alkene functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 15:</strong> is characterized by Amide, Amine, Disulfide functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 16:</strong> is characterized by Amine, Amide, Heterocyclic-P-CO-1 functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 17:</strong> is characterized by Sulfonate ester, Sulfone, BoronicAcid functional groups. (This cluster contains DTD.)</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 18:</strong> is characterized by Arene, Amide, Halogen functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 19:</strong> is characterized by Ketone, Sulfone, Halogen functional groups. (This cluster contains EC, PC, FEC, DEC, DMC, DME, and F5DEE.)</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 20:</strong> is characterized by Amide, Amine, Heterocyclic-P-CO-1 functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 21:</strong> is characterized by Heterocyclic-P-CO-1, Ketone, Heterocyclic-P-CS-1 functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 22:</strong> is characterized by Arene, Imide, Amide functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 23:</strong> is characterized by Amine, Nitro, Pyridine functional groups.</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 24:</strong> is characterized by Amide, Amine, Ether functional groups.</p>
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
                    By using Molecular Universe, you agree to our <NavLink to="/terms" style={{ color: '#0066cc', textDecoration: 'underline' }}>Terms and Privacy Policy.</NavLink>
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