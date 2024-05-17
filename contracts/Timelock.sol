// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Timelock {
    address public owner;
    
    struct AutoAction {
        uint256 amount;
        uint256 endTime;
    }

    mapping(address => uint256) public manualBalances;
    mapping(address => AutoAction[]) public autoDepositActions;
    mapping(address => AutoAction[]) public autoWithdrawActions; 

    address public tokenAddress;

    mapping(address => uint256) public autoBalances; // Mapping to store auto balances for each account

    event Deposit(address indexed _from, uint256 _amount, bool _isManual);
    event Withdrawal(address indexed _to, uint256 _amount, bool _isManual);
    event AutoDepositSet(address indexed _from, uint256 _amount, uint256 _endTime);
    event AutoWithdrawSet(address indexed _from, uint256 _amount, uint256 _endTime);
    event TotalBalanceUpdated(address indexed _address, uint256 _totalBalance);

    constructor(address _tokenAddress) {
        owner = msg.sender;
        tokenAddress = _tokenAddress;
    }

    function withdraw(uint256 _amount) external {
        require(_amount <= manualBalances[msg.sender], "Insufficient manual balance");
        
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(msg.sender, _amount), "Transfer failed");
        
        manualBalances[msg.sender] -= _amount;
        
        emit Withdrawal(msg.sender, _amount, true);
        
        emit TotalBalanceUpdated(msg.sender, getTotalBalance(msg.sender));
    }

    function setAutoDeposit(uint256 _amount, uint256 _seconds) external {
        uint256 endTime = block.timestamp + _seconds;
        autoDepositActions[msg.sender].push(AutoAction({
            amount: _amount,
            endTime: endTime
        }));
        
        emit AutoDepositSet(msg.sender, _amount, endTime);
    }

    function setAutoWithdraw(uint256 _amount, uint256 _seconds) external {
        uint256 endTime = block.timestamp + _seconds;
        autoWithdrawActions[msg.sender].push(AutoAction({
            amount: _amount,
            endTime: endTime
        }));
        
        emit AutoWithdrawSet(msg.sender, _amount, endTime);
    }

    function deposit(uint256 _amount) external {
        IERC20 token = IERC20(tokenAddress);
        
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        manualBalances[msg.sender] += _amount;
        
        emit Deposit(msg.sender, _amount, false);
        
        emit TotalBalanceUpdated(msg.sender, getTotalBalance(msg.sender));
    }

    function checkAutoActions() external {
        uint256 currentTime = block.timestamp;
        performAutoWithdraw(msg.sender, currentTime);
        performAutoDeposit(msg.sender, currentTime);
    }

    function performAutoDeposit(address _address, uint256 _currentTime) internal {
        AutoAction[] storage actions = autoDepositActions[_address];
        
        for (uint256 i = 0; i < actions.length; i++) {
            if (_currentTime >= actions[i].endTime) {
                IERC20 token = IERC20(tokenAddress);
                require(token.transferFrom(_address, address(this), actions[i].amount), "Transfer failed");
                
                autoBalances[_address] += actions[i].amount; // Update auto balance for the specific address
                
                emit Deposit(_address, actions[i].amount, false);
                
                emit TotalBalanceUpdated(_address, getTotalBalance(_address));
                
                // Remove the action from the array
                if (i < actions.length - 1) {
                    actions[i] = actions[actions.length - 1];
                }
                actions.pop();
            }
        }
    }

    function performAutoWithdraw(address _address, uint256 _currentTime) internal {
        AutoAction[] storage actions = autoWithdrawActions[_address];
        
        for (uint256 i = 0; i < actions.length; i++) {
            if (_currentTime >= actions[i].endTime) {
                uint256 availableBalance = getAutoBalance(_address);
                require(availableBalance >= actions[i].amount, "Insufficient auto balance");
                
                autoBalances[_address] -= actions[i].amount; // Update auto balance for the specific address
                
                IERC20 token = IERC20(tokenAddress);
                require(token.transfer(_address, actions[i].amount), "Transfer failed");
                
                emit Withdrawal(_address, actions[i].amount, false);
                
                emit TotalBalanceUpdated(_address, getTotalBalance(_address));
                
                // Remove the action from the array
                if (i < actions.length - 1) {
                    actions[i] = actions[actions.length - 1];
                }
                actions.pop();
            }
        }
    }

    function getTotalBalance(address _address) public view returns (uint256) {
        return manualBalances[_address] + getAutoBalance(_address);
    }

    function getAutoBalance(address _address) public view returns (uint256) {
        return autoBalances[_address]; // Retrieve auto balance for a specific address
    }

    function getAutoDepositActions(address _address) external view returns (AutoAction[] memory) {
        return autoDepositActions[_address];
    }

    function getAutoWithdrawActions(address _address) external view returns (AutoAction[] memory) {
        return autoWithdrawActions[_address];
    }

    receive() external payable {
        revert("Contract does not accept Ether directly");
    }
}