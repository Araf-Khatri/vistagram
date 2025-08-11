import { ErrorMessage } from "@/common/styles";
import { getLoggedInUser } from "@/components/Auth/handlers";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link } from "react-router-dom";
import styled from "styled-components";

const AppContainer = styled.div`
  position: relative;
`;

const Navbar = styled.nav`
  top: 0;
  position: sticky;
  background: ${({ theme }) => theme.bg || "#f7f7f7"};
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
`;

const Username = styled.div`
  font-weight: bold;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  text-decoration: none;
  color: ${({ theme }) => theme.text || "#000"};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.hover || "#ddd"};
  }
`;

const MobileMenu = styled.div`
  display: none;
  padding-bottom: 1rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PageContent = styled.main`
  padding: 1rem;
`;

const links = [
  { label: "Posts", path: "/" },
  { label: "Create Post", path: "/create" },
];

export default function HomeLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({
    username: null,
    id: null,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    getUserDetail();
  }, []);

  const getUserDetail = async () => {
    try {
      setLoading(true);
      const userDetails = await getLoggedInUser();
      setUserDetails(userDetails);
    } catch (err) {
      setErrorMessage("Unable to find username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <Navbar>
        <NavContainer>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          {loading ? (
            <span>fetching username...</span>
          ) : (
            <Username>{userDetails.username}</Username>
          )}
          <NavLinks>
            {links.map(({ label, path }) => (
              <Link to={path} key={path}>
                {label}
              </Link>
            ))}
          </NavLinks>
          <IconButton onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <IoClose /> : <RxHamburgerMenu />}
          </IconButton>
        </NavContainer>

        {isOpen && (
          <MobileMenu>
            <MobileLinks>
              {links.map(({ label, path }) => (
                <Link to={path} key={path}>
                  {label}
                </Link>
              ))}
            </MobileLinks>
          </MobileMenu>
        )}
      </Navbar>

      <PageContent>{children}</PageContent>
    </AppContainer>
  );
}
