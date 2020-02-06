pragma solidity 0.4.25;


contract DappToken{

  uint256 public totalSupply;
  uint8 public decimals;

  string public name;
  string public symbol;

  mapping(address => uint256) public balanceOf;
  mapping(address => uint256) public freezeOf;
  mapping(address => mapping(address => uint)) public allowance;

  event Transfer(address indexed _from, address indexed _to, uint256 _value);
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);
  event Burn(address indexed from, uint256 value);
  event Freeze(address indexed from, uint256 value);
  event Unfreeze(address indexed from, uint256 value);
  constructor(uint _initialSupply, string  _name, string _symbol, uint8 _decimals ) public {
    balanceOf[msg.sender] = _initialSupply;
    totalSupply = _initialSupply;
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
    
  }



  function transfer( address _to, uint256 _value ) public returns(bool success){
    require(balanceOf[msg.sender] >= _value,"Sender doesn't have enough tokens");

    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    emit Transfer(msg.sender,  _to, _value);
    return true;
  }

  function approve(address _spender, uint _value) public returns(bool success){
       require(balanceOf[msg.sender] >= _value,"Approver doesn't have enough tokens");

    allowance[msg.sender][_spender] += _value;

    emit Approval(msg.sender, _spender, _value);
      return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns(bool success) {
    require(_value <= balanceOf[_from],"Account doesn't have enough tokens");
    require(_value <= allowance[_from][msg.sender],"Allowance not enough");

    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;
    allowance[_from][msg.sender] -= _value;
    emit Transfer(msg.sender,  _to, _value);

    return true;
}

  function burn(uint256 _value) public returns(bool success){
      require(_value <= balanceOf[msg.sender],"Account does not have enough tokens");
      require(_value >= 0,"Amount must be positive");
      balanceOf[msg.sender] -= _value;
      totalSupply -= _value;
      emit Burn(msg.sender, _value);
      return true;
  }
  
  function freeze(uint256 _value) public returns(bool success){
      require(_value <= balanceOf[msg.sender],"Account does not have enough tokens");
      require(_value >= 0,"Amount must be positive");
      balanceOf[msg.sender] -= _value;
      freezeOf[msg.sender] += _value;
      emit Freeze(msg.sender, _value);
      return true;
  }
  
  function unfreeze(uint256 _value) public returns(bool success){
      require(_value <= freezeOf[msg.sender],"Account does not have enough tokens");
      require(_value >= 0,"Amount must be positive");
      freezeOf[msg.sender] -= _value;
      balanceOf[msg.sender] += _value;
      emit Unfreeze(msg.sender, _value);
      return true;
  }




}
