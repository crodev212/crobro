// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Template used by scripts/generate_brocode_contracts.js to inject the
///         compact on-chain SVG/metadata renderer into one deployable ERC-721.
interface IERC721ReceiverBroCode {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

contract BroCodeBaseline {
    error Unauthorized();
    error InvalidTokenId();
    error NonExistentToken();
    error InvalidRecipient();
    error InvalidApproval();
    error ExceedsMaxSupply();
    error WalletLimitExceeded();
    error SaleNotStarted();
    error SaleAlreadyStarted();
    error IncorrectPayment();
    error PayoutFailed();
    error ReentrancyLocked();
    error DirectPaymentNotAccepted();

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event SaleStarted(address indexed activator, uint256 timestamp);
    event Minted(address indexed minter, uint256 indexed firstTokenId, uint256 quantity, uint256 paid);

    uint256 public constant MAX_SUPPLY = 2121;
    uint256 public constant MAX_PER_WALLET = 10;
    uint256 public constant MINT_PRICE = 69 ether;
    uint96 public constant ROYALTY_BPS = 500;
    string public constant name = "$BROS";
    string public constant symbol = "BROS";
    uint256 public constant collectionSeed = uint256(keccak256("BRO_CODE_2121_GENESIS_SEED"));

    /// @dev Both the sale opener and all fixed proceeds/royalties go to this immutable address.
    address public immutable treasury;
    address public immutable saleOpener;
    bool public saleStarted;
    uint256 public totalSupply;
    mapping(address => uint256) public mintedBy;
    mapping(uint256 => address) internal _owners;
    mapping(address => uint256) internal _balances;
    mapping(uint256 => address) internal _tokenApprovals;
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    uint256 private _reentrancyLock = 1;

    modifier nonReentrant() {
        if (_reentrancyLock != 1) revert ReentrancyLocked();
        _reentrancyLock = 2;
        _;
        _reentrancyLock = 1;
    }

    constructor(address treasury_) {
        if (treasury_ == address(0)) revert InvalidRecipient();
        treasury = treasury_;
        saleOpener = treasury_;
    }

    /// @notice One irreversible activation. It does not change price, supply, traits, or metadata.
    ///         The treasury wallet can call this once when the public mint is announced.
    function startSale() external {
        if (msg.sender != saleOpener) revert Unauthorized();
        if (saleStarted) revert SaleAlreadyStarted();
        saleStarted = true;
        emit SaleStarted(msg.sender, block.timestamp);
    }

    /// @notice Public paid mint. Price and per-address cap are fixed in bytecode.
    function mint(uint256 quantity) external payable nonReentrant {
        if (!saleStarted) revert SaleNotStarted();
        if (quantity == 0 || quantity > MAX_PER_WALLET || totalSupply + quantity > MAX_SUPPLY) {
            revert ExceedsMaxSupply();
        }
        if (mintedBy[msg.sender] + quantity > MAX_PER_WALLET) revert WalletLimitExceeded();
        uint256 due = MINT_PRICE * quantity;
        if (msg.value != due) revert IncorrectPayment();

        uint256 firstTokenId = totalSupply + 1;
        totalSupply += quantity;
        mintedBy[msg.sender] += quantity;
        _balances[msg.sender] += quantity;

        for (uint256 i; i < quantity; ++i) {
            uint256 tokenId = firstTokenId + i;
            _owners[tokenId] = msg.sender;
            emit Transfer(address(0), msg.sender, tokenId);
            _checkOnERC721Received(msg.sender, address(0), msg.sender, tokenId, "");
        }

        (bool ok, ) = payable(treasury).call{value: due}("");
        if (!ok) revert PayoutFailed();
        emit Minted(msg.sender, firstTokenId, quantity, due);
    }

    /// @notice ERC-165, ERC-721, ERC-721 Metadata and ERC-2981 support.
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || interfaceId == 0x80ac58cd ||
            interfaceId == 0x5b5e139f || interfaceId == 0x2a55205a;
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        if (tokenId == 0 || tokenId > MAX_SUPPLY) revert InvalidTokenId();
        return (treasury, (salePrice * ROYALTY_BPS) / 10000);
    }

    function balanceOf(address account) external view returns (uint256) {
        if (account == address(0)) revert InvalidRecipient();
        return _balances[account];
    }

    function ownerOf(uint256 tokenId) public view returns (address tokenOwner) {
        tokenOwner = _owners[tokenId];
        if (tokenOwner == address(0)) revert NonExistentToken();
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        if (to == tokenOwner) revert InvalidApproval();
        if (msg.sender != tokenOwner && !isApprovedForAll[tokenOwner][msg.sender]) revert Unauthorized();
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        ownerOf(tokenId);
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        if (operator == msg.sender) revert InvalidApproval();
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        if (to == address(0)) revert InvalidRecipient();
        address tokenOwner = ownerOf(tokenId);
        if (tokenOwner != from) revert Unauthorized();
        if (msg.sender != from && msg.sender != _tokenApprovals[tokenId] && !isApprovedForAll[from][msg.sender]) revert Unauthorized();
        delete _tokenApprovals[tokenId];
        unchecked {
            _balances[from] -= 1;
            _balances[to] += 1;
        }
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(msg.sender, from, to, tokenId, data);
    }

    function _checkOnERC721Received(address operator, address from, address to, uint256 tokenId, bytes memory data) internal {
        if (to.code.length == 0) return;
        try IERC721ReceiverBroCode(to).onERC721Received(operator, from, tokenId, data) returns (bytes4 response) {
            if (response != IERC721ReceiverBroCode.onERC721Received.selector) revert InvalidRecipient();
        } catch {
            revert InvalidRecipient();
        }
    }

    /// @notice Collection-level metadata and a self-contained vector logo.
    ///         Marketplaces may or may not read contractURI; each minted token also has tokenURI.
    function contractURI() external view returns (string memory) {
        string memory prefix = "data:application/json;utf8,{\"name\":\"$BROS\",\"symbol\":\"BROS\",\"description\":\"The fist bump of Cronos. BRO CODE on-chain avatars. Public mint: 69 CRO each; max 10 per address; all 2,121 are public; 5% creator royalty. Not a claim on the $BRO token or a promise of returns.\",\"external_url\":\"https://brocode.surge.sh/\",\"related_token_contract\":\"0xbda25adb44124b9cbb1b747ceb788ef594750e6f\",\"image\":\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='navy'/><path d='M0 0H12L27 21L19 17ZM64 0H52L37 21L45 17ZM0 40L20 27L17 39L0 56ZM64 40L44 27L47 39L64 56Z' fill='royalblue'/><path d='M8 50L17 18H47L56 50Z' fill='royalblue' stroke='black' stroke-width='3'/><circle cx='32' cy='27' r='13' fill='tan' stroke='black' stroke-width='2'/><path d='M18 18L20 7H44L47 18Z' fill='royalblue' stroke='black' stroke-width='2'/><path d='M16 18H47L54 21H16Z' fill='navy'/><path d='M19 23H29V30H19ZM35 23H45V30H35Z' fill='black'/><circle cx='24' cy='26' r='3' fill='gold'/><circle cx='40' cy='26' r='3' fill='gold'/><path d='M25 36Q32 42 39 36' fill='none' stroke='black' stroke-width='3'/><path d='M23 44Q32 52 41 44' fill='none' stroke='gold' stroke-width='3'/><circle cx='32' cy='51' r='5' fill='gold' stroke='black' stroke-width='1'/><path d='M5 44L15 39L22 47L16 56Z' fill='tan' stroke='black' stroke-width='2'/></svg>\",\"seller_fee_basis_points\":500,\"fee_recipient\":\"";
        return string.concat(prefix, _addressText(treasury), "\"}");
    }

    function _addressText(address account) internal pure returns (string memory) {
        bytes16 alphabet = "0123456789abcdef";
        bytes memory out = new bytes(42);
        out[0] = "0";
        out[1] = "x";
        uint160 value = uint160(account);
        for (uint256 i; i < 20; ++i) {
            uint8 b = uint8(value >> (8 * (19 - i)));
            out[2 + i * 2] = alphabet[b >> 4];
            out[3 + i * 2] = alphabet[b & 0x0f];
        }
        return string(out);
    }

    /// @notice CRO sent directly by mistake is rejected. Forced CRO can only be swept to treasury.
    receive() external payable { revert DirectPaymentNotAccepted(); }

    function sweepForcedCRO() external nonReentrant {
        uint256 amount = address(this).balance;
        if (amount == 0) return;
        (bool ok, ) = payable(treasury).call{value: amount}("");
        if (!ok) revert PayoutFailed();
    }

    
    function getTraits(uint256 tokenId) external view returns (uint64 packed, uint8 rarityTier, uint8 oneOfOneId) {
        ownerOf(tokenId);
        return (0, 0, 255);
    }
    function previewSVG(uint256 tokenId) external pure returns (string memory) {
        if (tokenId == 0 || tokenId > MAX_SUPPLY) revert InvalidTokenId();
        return "<svg></svg>";
    }
    function renderSVG(uint256 tokenId) external pure returns (string memory) {
        if (tokenId == 0 || tokenId > MAX_SUPPLY) revert InvalidTokenId();
        return "<svg></svg>";
    }
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        ownerOf(tokenId);
        return "data:application/json;utf8,{}";
    }

}
