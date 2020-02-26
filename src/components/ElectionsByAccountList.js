import React, { Component } from "react";
import VotingForm from "./VotingForm";

export class ElectionsByAccountList extends Component {

    constructor(props) {
        super(props);

    }

    // Obtener el candidato ganador de la elección
    async getResultElection(election) {       
        let candidatoGanador;
        await this.props.BEVService.getResultElection(election).then((receipt) => {
            if(receipt.status == 200)
                candidatoGanador = JSON.stringify(receipt.data);
            else
                candidatoGanador = receipt.data;
        });

        return candidatoGanador;
    }

    // Obtener todos los candidatos de una elección
    async getDetailsByElection(election) {     
        let candidatesByElection;
        await this.props.BEVService.getDetailsByElection(election).then((receipt) => {
            if(receipt.status == 200)
                candidatesByElection = JSON.stringify(receipt.data);
            else
                candidatesByElection = receipt.data;
        });
        
        return candidatesByElection;
    }

    renderTableDataElectionsByAccount () {
        if(this.props.state.conected) {
            return this.props.state.electionsByAccount.map((election) => {
            const { id, name, active, yaVoto } = election
            return (
                <tr key={id}>
                    <td>{id}</td>
                    <td>{name}</td>
                    <td>{active}</td>
                    <td>{yaVoto}</td>
                    <td>
                        <button 
                            className="btn btn-primary" 
                            data-target="#electionByAccountModal"
                            data-toggle="modal"
                            type="button"                                                         
                            >Votar
                        </button>
                        <button 
                            className="btn btn-link"                                                         
                            onClick={
                                    async () => {
                                        let result = await this.getResultElection(id);
                                        document.querySelector('#electionByAccountResult').innerText = result;
                                }
                            } 
                            type="button"
                            >Resultados
                        </button>
                        <button 
                            className="btn btn-link"                                                         
                            onClick={
                                    async () => {
                                        let result = await this.getDetailsByElection(id);
                                        document.querySelector('#electionByAccountResult').innerText = result;
                                }
                            } 
                            type="button"
                            >Detalles
                        </button>
                    </td>
                </tr>
                )
            })
        }
    }

    renderTableElectionsByAccount () {
        if(this.props.state.conected) {
            if(this.props.state.electionsByAccount.length == 0)
                return <p>No hay elecciones para mostrar.</p>
            else {  
                return <table className="table border">
                <thead className="thead-dark">
                    <tr>
                        <th>Número</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Ya Voto</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="electionTableByAccount">
                    {this.renderTableDataElectionsByAccount()}
                </tbody>
            </table>
            }
        }
    }

    render () {
        return <div id="electionsByAccount">
                <h3>Elecciones</h3>
                <hr />
                <br/>   
                {this.renderTableElectionsByAccount()}
                <br/>
                <div className="modal" id="electionByAccountModal">
                    <VotingForm 
                        account={this.props.state.account}
                        BEVService={this.props.BEVService}                         
                        candidates={this.props.state.candidates}
                        elections={this.props.state.electionsByAccount}
                    />
                </div>
                <p id="electionByAccountResult"></p>
            </div>
    }
}
