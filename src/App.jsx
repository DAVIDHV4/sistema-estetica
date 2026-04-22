import React, { useState } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const initialFormState = {
    nombre: '', dni: '', edad: '', telefono: '',
    fecha: new Date().toLocaleDateString('sv-SE'), // Formato YYYY-MM-DD local
    procedimiento: '', cantidad: 1, estadoPago: 'Pagado',
    zona: '', profesional: 'Navarro', proximaSesion: '',
    procRealizar: '', estadoRetoque: 'Pendiente', observaciones: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/save-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setShowModal(true);
        setFormData(initialFormState);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>REGISTRO EXITOSO</h2>
            <p>La información ha sido guardada en el Excel y el calendario correctamente.</p>
            <button onClick={() => setShowModal(false)} className="modal-button">ENTENDIDO</button>
          </div>
        </div>
      )}
      
      <h1 className="title">SISTEMA MÉDICO - DERMATOLOGÍA</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <span className="section-title">DATOS DEL PACIENTE</span>
          <div className="form-row">
            <div className="field" style={{flex: 2}}>
              <label>NOMBRES Y APELLIDOS</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>FECHA DE REGISTRO</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>DNI / CE</label>
              <input name="dni" value={formData.dni} onChange={handleChange} />
            </div>
            <div className="field">
              <label>EDAD</label>
              <input name="edad" type="number" value={formData.edad} onChange={handleChange} />
            </div>
            <div className="field">
              <label>TELÉFONO</label>
              <input name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <span className="section-title">DETALLES DEL SERVICIO</span>
          <div className="full-width">
            <label>PROCEDIMIENTO REALIZADO</label>
            <input name="procedimiento" value={formData.procedimiento} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="field">
              <label>ESTADO DE PAGO</label>
              <select name="estadoPago" value={formData.estadoPago} onChange={handleChange}>
                <option value="Pagado">PAGADO</option>
                <option value="Pendiente">PENDIENTE</option>
                <option value="Consulta gratis">CONSULTA GRATIS</option>
              </select>
            </div>
            <div className="field">
              <label>PROFESIONAL</label>
              <select name="profesional" value={formData.profesional} onChange={handleChange}>
                <option value="Navarro">NAVARRO</option>
                <option value="Burgos">BURGOS</option>
                <option value="Sherley">SHERLEY</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>CANTIDAD</label>
              <input name="cantidad" type="number" value={formData.cantidad} onChange={handleChange} />
            </div>
            <div className="field">
              <label>ZONA TRATADA</label>
              <input name="zona" value={formData.zona} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <span className="section-title" style={{color: '#e60000', borderColor: '#e60000'}}>SEGUIMIENTO Y RETOQUES</span>
          <div className="form-row">
            <div className="field">
              <label>PRÓXIMA SESIÓN</label>
              <input type="date" name="proximaSesion" value={formData.proximaSesion} onChange={handleChange} style={{borderColor: '#e60000'}} />
            </div>
            <div className="field">
              <label>ESTADO / RETOQUE</label>
              <select name="estadoRetoque" value={formData.estadoRetoque} onChange={handleChange}>
                <option value="Pendiente">PENDIENTE</option>
                <option value="Realizado">REALIZADO</option>
                <option value="No aplica">NO APLICA</option>
              </select>
            </div>
          </div>
          <div className="full-width">
            <label>PROCEDIMIENTO PENDIENTE</label>
            <input name="procRealizar" value={formData.procRealizar} onChange={handleChange} />
          </div>
          <div className="full-width">
            <label>OBSERVACIONES ADICIONALES</label>
            <textarea name="observaciones" rows="2" value={formData.observaciones} onChange={handleChange}></textarea>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'ENVIANDO DATOS...' : 'GUARDAR REGISTRO'}
        </button>
      </form>
    </div>
  );
}

export default App;