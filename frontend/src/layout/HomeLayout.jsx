import ConfirmationPopup from "@/common/ConfirmationPopup";
import { logoutHandler } from "@/components/Auth/handlers";
import UserContext from "@/context/userContext";
import { useContext, useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdOutlineLogout } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link, Outlet, useNavigate } from "react-router-dom";
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

const MobileViewMenu = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const IconButton = styled.button`
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
`;

const NavInteractions = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

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

export default function HomeLayout() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { userDetails } = useContext(UserContext);
  const [logoutConfirmationPopup, setLogoutConfirmationPopup] = useState({
    show: false,
    loading: false,
  });

  const logoutUser = async () => {
    try {
      setLogoutConfirmationPopup((prev) => ({ ...prev, loading: true }));
      await logoutHandler();
      setTimeout(() => navigate("/login", { replace: true }), 500);
    } catch (err) {
      // setErrorMessage("Unanble to logout user");
    } finally {
      setLogoutConfirmationPopup((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <AppContainer>
      <ConfirmationPopup
        isOpen={logoutConfirmationPopup.show}
        title="Are you sure you want to log out?"
        description="You will be signed out of your account and may need to log in again to continue."
        confirmCtaText="Log out"
        onConfirm={logoutUser}
        loading={logoutConfirmationPopup.loading}
        cancelCtaText="Cancel"
        onClose={() =>
          setLogoutConfirmationPopup((prev) => ({ ...prev, show: false }))
        }
      />
      <Navbar>
        <NavContainer>
          {!userDetails.userFound ? (
            <span>fetching username...</span>
          ) : (
            <Username>{userDetails.username}</Username>
          )}
          <NavInteractions>
            <NavLinks>
              {links.map(({ label, path }) => (
                <Link to={path} key={path}>
                  {label}
                </Link>
              ))}
            </NavLinks>
            <MobileViewMenu onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <IoClose /> : <RxHamburgerMenu />}
            </MobileViewMenu>
            <IconButton
              onClick={() =>
                setLogoutConfirmationPopup((prev) => ({ ...prev, show: true }))
              }
            >
              <MdOutlineLogout />
            </IconButton>
          </NavInteractions>
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

      <PageContent>
        <Outlet />
      </PageContent>
    </AppContainer>
  );
}
