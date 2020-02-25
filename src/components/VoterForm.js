import React from "react";
import { useFormik } from 'formik';

// Formulario de votante
const VoterForm = (props) => {
    const formik = useFormik({
        initialValues: {
            idElectionVoter: 0,
            voterAddress: "",
            voterName: "",
        },
        onSubmit: values => {
            props.BEVService.addVoter(values.idElectionVoter, values.voterAddress, values.voterName, props.account).then((receipt) => {
                let result;
                if(receipt.status == 200)
                    result = "Transaccion realizada correctamente: " + receipt.data.tx;
                else
                    result = receipt.data;

                document.querySelector('#voterResult').innerText = result;
            });
            values.idElectionVoter = 0;
            values.voterAddress = "";
            values.voterName = "";
            $('#voterModal').modal('hide');
        },
    });
    return (<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title">Nuevo Votante</h4>
                    <button                                                     
                        className="close" 
                        data-dismiss="modal"
                        type="button"
                        >&times;
                    </button>
                </div>                                        
                <div className="modal-body">
                    <form onSubmit={formik.handleSubmit}>
                    <label htmlFor="idElectionVoter">Nro de Elección</label>
                    <input className="form-control" placeholder="Enter election"
                        id="idElectionVoter"
                        name="idElectionVoter"
                        type="number"
                        onChange={formik.handleChange}
                        value={formik.values.idElectionVoter}
                    />
                    <label htmlFor="voterAddress">Cuenta del Votante</label>
                    <input className="form-control" placeholder="Enter address"
                        id="voterAddress"
                        name="voterAddress"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.voterAddress}
                    />
                    <label htmlFor="voterName">Nombre del Votante</label>
                    <input className="form-control" placeholder="Enter name"
                        id="voterName"
                        name="voterName"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.voterName}
                    />
                    <br />
                    <div className="modal-footer">
                        <button type="button" className="btn btn-light" data-dismiss="modal">Cancelar</button>
                        <button type="submit" className="btn btn-success">Guardar</button>
                    </div>
                    </form>
                </div>                                                                        
            </div>
        </div>
    );
};

export default VoterForm;