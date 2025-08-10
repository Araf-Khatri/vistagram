import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import styled from "styled-components";

const Links = ["Dashboard", "Projects", "Team"];

const Navbar = styled.nav`
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

const Logo = styled.div`
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

export default function HomeLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Navbar>
        <NavContainer>
          <Logo>Logo</Logo>
          <NavLinks>
            {Links.map((link) => (
              <NavLink href="#" key={link}>
                {link}
              </NavLink>
            ))}
          </NavLinks>
          <IconButton onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <IoClose /> : <RxHamburgerMenu />}
          </IconButton>
        </NavContainer>

        {isOpen && (
          <MobileMenu>
            <MobileLinks>
              {Links.map((link) => (
                <NavLink href="#" key={link}>
                  {link}
                </NavLink>
              ))}
            </MobileLinks>
          </MobileMenu>
        )}
      </Navbar>

      <PageContent>{children}</PageContent>
    </>
  );
}
