import React, { Component } from "react";
import ElectionForm from "./ElectionForm";
import swal from '@sweetalert/with-react'; // https://www.npmjs.com/package/@sweetalert/with-react

export class ElectionList extends Component {

    constructor(props) {
        super(props);
    }
    
    // Notificaciones de trasacciones
    notify (receipt) {
        if(receipt.status == 200)
            swal("Transacción realizada correctamente!", receipt.data.tx, "success");
        else
            swal("Error al realizar la transacción!", receipt.data, "error");
    }

    // Obtengo una eleccion    
    async getElection(id) {         
        let election;
        await this.props.BEVService.getElection(id).then((receipt) => {       
            /*if(receipt.status == 200)
                election = receipt.data;
            else*/
                election = receipt.data; 
        });
        return election;
    }

    // Activar una elección
    async activeElection(id, active) {
        let act = false
        if(active == "false")
            act = true;

        await this.props.BEVService.activeElection(id, act, this.props.state.account).then((receipt) => {
            this.notify(receipt);
        });
    }

    // Eliminar una elección
    async deleteElection(id) {
        await this.props.BEVService.deleteElection(id, this.props.state.account).then((receipt) => {
            this.notify(receipt);
        });
    }

    // Información de la elección
    electionDisplay(election) {
        swal(<div>
                <h3>{election.name}</h3>
                <br/>
                <br/>
                <div className="form-group row">
                    <div className="col-sm-2"></div>
                    <label className="col-sm-2 control-label text-left"><strong>Número:</strong></label>
                    <div className="col-sm-4">
                        <p className="form-control-static">{election.id}</p>
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-sm-2"></div>
                    <label className="col-sm-2 control-label text-left"><strong>Activada:</strong></label>
                    <div className="col-sm-4">
                        <p className="form-control-static">{election.active}</p>
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-sm-2"></div>
                    <label className="col-sm-2 control-label text-left"><strong>Cadidatos:</strong></label>
                    <div className="col-sm-4">
                        <p className="form-control-static">{election.candidatesCount}</p>
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-sm-2"></div>
                    <label className="col-sm-2 control-label text-left"><strong>Votantes:</strong></label>
                    <div className="col-sm-4">
                        <p className="form-control-static">{election.votersCount}</p>
                    </div>
                </div>
            </div>
          );
    }

    // Genero los registros con los datos de las elecciones
    renderTableDataElections() {                      
        return this.props.state.elections.map((election) => {
            const { id, name, active, candidatesCount, votersCount } = election
            return (
                <tr key={id}>
                    <td>{id}</td>
                    <td>{name}</td>
                    <td>{active}</td>
                    <td>{candidatesCount}</td>
                    <td>{votersCount}</td>
                    <td>
                        <button 
                            className="btn btn-info"
                            onClick={
                                async () => {
                                    let result = await this.getElection(id);                                
                                    this.electionDisplay(result);
                                }
                            }
                            type="button"                            
                            >Info
                        </button>
                        <button 
                            className="btn btn-warning"
                            onClick={ async () => { await this.activeElection(id, active); } }
                            type="button"                            
                            >Activar
                        </button> 
                        <button 
                            className="btn btn-danger"                              
                            onClick={ async () => { await this.deleteElection(id); } } 
                            type="button"
                            >Borrar
                        </button>
                    </td>
                </tr>
            )
        })
    }

    renderTableElections() {
            if(this.props.state.elections.length == 0)
                return <p>No hay elecciones para mostrar.</p>
            else {
                return <table className="table border">
                    <thead className="thead-dark">
                        <tr>
                            <th>Número</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Candidatos</th>
                            <th>Votantes</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="electionTable">
                        {this.renderTableDataElections()}
                    </tbody>
                </table>
            }
    }

    render() {
        return <div id="elections">
                <h4>Elecciones</h4>
                <hr />
                <div className="input-group row">  
                    <div className="input-group-append col-sm-2"></div>                                          
                    <div className="input-group-append col-sm-6">   
                        <input 
                            className="form-control" 
                            id="electionInput" 
                            placeholder="Buscar" 
                            ref={ this.electionInput } 
                            type="text" 
                        />                                                        
                    </div>
                    <div className="btn-group col-sm-2">                                
                        <button 
                            className="btn btn-success" 
                            data-target="#electionModal"
                            data-toggle="modal"                                         
                            type="button"                                             
                            >Nueva
                        </button>
                    </div>
                </div>
                <br/>  
                {this.renderTableElections()}                  
                <br/>
                <div className="modal" id="electionModal">
                    <ElectionForm 
                        account={this.props.state.account}
                        BEVService={this.props.BEVService} 
                        web3={this.props.web3}
                    />
                </div>
            </div>
    }
}
