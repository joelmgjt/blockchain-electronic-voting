pragma solidity ^0.4.24;

contract BEV {
    address private owner; // Propietario del contrato
    mapping(address => bool) public admins; // Lista de administradores

    // Estructura de candidato
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Estructura de votante
    struct Voter {
        string name;
        bool voted;
    }

    // Estructura de elección
    struct Election {
        uint id;
        string name;
        bool active; // Estado de la elección => activa = true
        uint candidatesCount;// Almacenar el recuento de los candidatos
        uint votersCount; // Almacenar el recuento de los votantes

        mapping(uint => Candidate) candidates; // Lectura/escritura de candidatos
        mapping(address => Voter) voters; // Lectura/escritura de los votantes
        mapping(address => bool) joinedVoters; // Almacenar cuentas que pueden votar
    }

    mapping(uint => Election) private elections; // Lista de elecciones
    uint private electionsCount; // Almacenar el recuento de las elecciones
    
    event electionEvent (
        uint indexed _idElection,
        bool _active
    );

    event votedEvent (
        uint indexed _idElection,
        uint indexed _candidateId
    );

    // Validar si es propietario
    modifier isOwner(){
        require(owner == msg.sender);
        _;
    }

    // Validar si es administrador
    modifier isAdmin(){
        require(admins[msg.sender]);
        _;
    }

    constructor () public {
        owner = msg.sender; // Quien publica el contrato es el dueño
        admins[msg.sender] = true; // Es administrador tambien
    }

    // Agregar un administrador
    function addAdmin(address _addr) public isOwner {
        require(!admins[_addr], "Ya es administrador.");
        admins[_addr] = true;
    }

    // Quitar un administrador
    function deleteAdmin(address _addr) public isOwner {
        require(admins[_addr], "No es administrador.");
        admins[_addr] = false;
    }

    // Agregar una elección
    function addElection(string _name) public isAdmin {
        electionsCount++;
        elections[electionsCount] = Election(electionsCount, _name, false, 0, 0);
        //elections.push(Election(_name, false, 0, 0));
    }

    // Obtener detalles de una elección
    function getElection(uint _idElection) public view returns(uint, string, bool, uint, uint) {
        require(electionIsValid(_idElection), "Elección no valida");
        Election memory election = elections[_idElection];
        return (election.id, election.name, election.active, election.candidatesCount, election.votersCount);
    }

    // Activar una elección
    function activeElection(uint _idElection, bool _active) public isAdmin {
        require(electionIsValid(_idElection), "Elección no valida");
        elections[_idElection].active = _active;

        emit electionEvent(_idElection, _active);
    }

   // Eliminar una elección
    function deleteElection(uint _idElection) public isAdmin {
        require(electionIsValid(_idElection), "Elección no valida");
        require(elections[_idElection].votersCount == 0,"Hay votantes");
        require(elections[_idElection].candidatesCount == 0, "Hay candidatos");

        electionsCount--;
        delete elections[_idElection];
    }

    // Devuelve la cantidad de elecciones que hay en el contrato
    function getTotalElections() public view returns(uint) {
        return electionsCount;
    }

    // Comprobar si la eleccion es valida
    function electionIsValid(uint _idElection) private view returns(bool) {
        if(_idElection > 0 && _idElection <= electionsCount)
            return true;
        
        return false;
    }

    // Agregar un candidato
    function addCandidate (uint _idElection, string _name) public isAdmin {
        require(electionIsValid(_idElection), "Elección no valida");
        elections[_idElection].candidatesCount++;
        elections[_idElection].candidates[elections[_idElection].candidatesCount] = Candidate(elections[_idElection].candidatesCount, _name, 0);
    }

    // Obtener un candidato
    function getCandidate(uint _idElection, uint _candidateId) public view returns(uint, string, uint) {
        require(electionIsValid(_idElection), "Elección no valida");
        require(candidateIsValid(_idElection, _candidateId), "Candidato no valido");
        Candidate memory candidate = elections[_idElection].candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }

   // Eliminar un candidato
    function deleteCandidate(uint _idElection, uint _candidateId) public isAdmin {
        require(electionIsValid(_idElection), "Elección no valida");
        require(candidateIsValid(_idElection, _candidateId), "Candidato no valido");
        elections[_idElection].candidatesCount--;
        delete elections[_idElection].candidates[_candidateId];
    }

    // Obtener la cantidad de candidatos de una elección
    function getCandidatesCount (uint _idElection) public view returns(uint){
        require(electionIsValid(_idElection), "Elección no valida");
        return elections[_idElection].candidatesCount;
    }

    // Comprobar si el candidato es valido
    function candidateIsValid(uint _idElection, uint _candidateId) private view returns(bool) {
        require(electionIsValid(_idElection), "Elección no valida");
        if(_candidateId > 0 && _candidateId <= elections[_idElection].candidatesCount)
            return true;
        
        return false;
    }

    // Agregar un votante
    function addVoter (uint _idElection, address _addr, string _name) public isAdmin {
        require(electionIsValid(_idElection), "Elección no valida");
        elections[_idElection].votersCount++;
        elections[_idElection].voters[_addr] = Voter(_name, false);
        elections[_idElection].joinedVoters[_addr] = true;
    }

    // Comprobar si el votante esta en el padrón
    function voterIsJoined(uint _idElection, address _addr) public view returns(bool) {
        require(electionIsValid(_idElection), "Elección no valida");
        return elections[_idElection].joinedVoters[_addr];
    }

   // Eliminar votante
    function deleteVoter(uint _idElection, address _addr) public isAdmin {
        require(electionIsValid(_idElection), "Elección no valida");
        require(voterIsJoined(_idElection, _addr),"El usuario no existe!");
        require(!voterHasVoted(_idElection, _addr), "Votante ya voto");
        
        elections[_idElection].votersCount--;
        elections[_idElection].joinedVoters[_addr] = false;
        delete elections[_idElection].voters[_addr];
    }

    // Obtener la cantidad de votantes de la elección
    function getVotersCount (uint _idElection) public view returns(uint){
        require(electionIsValid(_idElection), "Elección no valida");
        return elections[_idElection].votersCount;
    }
    
    // Votar
    function voting (uint _idElection, uint _candidateId) public {
        require(electionIsValid(_idElection), "Elección no valida"); // Requerir una elección válida
        // Exigir que sea un votante valido y que no haya votado antes
        require(voterIsJoined(_idElection, msg.sender), "Votante no valido");
        require(!voterHasVoted(_idElection, msg.sender), "Votante ya voto");
        require(candidateIsValid(_idElection, _candidateId), "Candidato no valido"); // Requerir un candidato válido
        
        elections[_idElection].voters[msg.sender].voted = true; // Registro de que el votante ha votado
        elections[_idElection].candidates[_candidateId].voteCount ++; // Registro de que el votante ha votado
        emit votedEvent(_idElection, _candidateId); // Evento desencadenante del voto
    }

    // Comprobar si el votante ya voto
    function voterHasVoted(uint _idElection, address _addr) public view returns(bool) {
        require(electionIsValid(_idElection), "Elección no valida");
        require(voterIsJoined(_idElection, _addr), "Votante no valido");
        return elections[_idElection].voters[_addr].voted;
    }
}