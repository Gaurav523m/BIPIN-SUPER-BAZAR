import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-6 mt-8">
      <div className="container mx-auto px-3 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary text-3xl"><i className='bx bx-cart'></i></span>
              <span className="text-xl font-bold">QuickCart</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">We deliver groceries at your doorstep in 10 minutes.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-primary"><i className='bx bxl-facebook text-xl'></i></a>
              <a href="#" className="text-gray-500 hover:text-primary"><i className='bx bxl-twitter text-xl'></i></a>
              <a href="#" className="text-gray-500 hover:text-primary"><i className='bx bxl-instagram text-xl'></i></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/1" className="text-gray-600 hover:text-primary">Fruits & Vegetables</Link></li>
              <li><Link href="/category/2" className="text-gray-600 hover:text-primary">Dairy & Breakfast</Link></li>
              <li><Link href="/category/3" className="text-gray-600 hover:text-primary">Snacks & Beverages</Link></li>
              <li><Link href="/category/5" className="text-gray-600 hover:text-primary">Bakery</Link></li>
              <li><Link href="/category/6" className="text-gray-600 hover:text-primary">Household</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-primary">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">FAQs</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <i className='bx bx-map text-primary'></i>
                <span className="text-gray-600">123 Main Street, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-2">
                <i className='bx bx-phone text-primary'></i>
                <a href="tel:+1234567890" className="text-gray-600 hover:text-primary">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center gap-2">
                <i className='bx bx-envelope text-primary'></i>
                <a href="mailto:support@quickcart.com" className="text-gray-600 hover:text-primary">support@quickcart.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-4 md:mb-0">© 2023 QuickCart. All rights reserved.</p>
          <div className="flex gap-4">
            <svg className="h-8 w-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4C35.0457 4 44 12.9543 44 24Z" fill="#1A1F71"/>
              <path d="M19.6155 31.4217H16.0859L18.1806 16.4717H21.7102L19.6155 31.4217Z" fill="#FFFFFF"/>
              <path d="M31.5967 16.7425C30.8285 16.4717 29.6233 16.1592 28.1464 16.1592C24.4727 16.1592 21.8247 18.055 21.8247 20.8717C21.8247 22.9425 23.7043 24.0883 25.1393 24.8133C26.5743 25.5383 27.0285 26.0092 27.0285 26.6508C27.0285 27.6342 25.8235 28.08 24.6602 28.08C23.1001 28.08 22.261 27.8508 20.9689 27.2925L20.5147 27.0633L20.0189 30.1675C20.9689 30.5633 22.6743 30.9175 24.4727 30.9175C28.396 30.9175 30.9611 29.0217 30.9611 26.06C30.9611 24.4133 29.9285 23.1383 27.8755 22.0758C26.6289 21.3508 25.9027 20.9133 25.9027 20.2717C25.9027 19.6717 26.6289 19.0717 28.1464 19.0717C29.3931 19.0717 30.2739 19.3425 30.9152 19.6133L31.2347 19.7592L31.5967 16.7425Z" fill="#FFFFFF"/>
              <path d="M36.5687 16.4717H33.8372C33.0772 16.4717 32.5022 16.7008 32.178 17.4675L27.8022 31.4217H31.7255C31.7255 31.4217 32.3272 29.7342 32.4605 29.3383C32.8218 29.3383 36.3938 29.3383 36.8472 29.3383C36.953 29.8508 37.2726 31.4217 37.2726 31.4217H40.738L36.5687 16.4717ZM33.4338 26.4633C33.7113 25.7383 34.9172 22.3883 34.9172 22.3883C34.9172 22.43 35.1538 21.8 35.2872 21.3967L35.5238 22.2967C35.5238 22.2967 36.2509 25.82 36.3938 26.505H33.4338V26.4633Z" fill="#FFFFFF"/>
            </svg>
            <svg className="h-8 w-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4C35.0457 4 44 12.9543 44 24Z" fill="#252525"/>
              <path d="M17.1773 30.9738H30.4632V17.0762H17.1773V30.9738Z" fill="#FF5F00"/>
              <path d="M17.9543 24.025C17.9543 21.0786 19.3583 18.4353 21.5993 16.8C20.0472 15.565 18.1042 14.845 16.0001 14.845C10.8652 14.845 6.7002 19.01 6.7002 24.145C6.7002 29.28 10.8652 33.445 16.0001 33.445C18.1042 33.445 20.0472 32.725 21.5993 31.49C19.3583 29.9742 17.9543 27.2117 17.9543 24.025Z" fill="#EB001B"/>
              <path d="M40.9505 24.145C40.9505 29.28 36.7855 33.445 31.6505 33.445C29.5465 33.445 27.6035 32.725 26.0514 31.49C28.4124 29.855 29.6964 27.2117 29.6964 24.025C29.6964 20.8383 28.2924 18.1953 26.0514 16.8C27.6035 15.565 29.5465 14.845 31.6505 14.845C36.7855 14.845 40.9505 19.13 40.9505 24.145Z" fill="#F79E1B"/>
            </svg>
            <svg className="h-8 w-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4Z" fill="black"/>
              <path d="M17.0909 15.4545C17.0909 14.6509 17.7418 14 18.5454 14H29.4545C30.2582 14 30.9091 14.6509 30.9091 15.4545V32.5454C30.9091 33.3491 30.2582 34 29.4545 34H18.5454C17.7418 34 17.0909 33.3491 17.0909 32.5454V15.4545ZM24 31.0909C25.6109 31.0909 26.9091 29.7927 26.9091 28.1818C26.9091 26.5709 25.6109 25.2727 24 25.2727C22.3891 25.2727 21.0909 26.5709 21.0909 28.1818C21.0909 29.7927 22.3891 31.0909 24 31.0909Z" fill="white"/>
            </svg>
            <svg className="h-8 w-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="20" fill="white"/>
              <path d="M24.72 23.28H32.08V24.8H24.72V32.4H23.28V24.8H16V23.28H23.28V16H24.72V23.28Z" fill="#4285F4"/>
              <path d="M36.8 16V32H32V36.8H16V16H36.8ZM38.4 14.4H14.4V38.4H33.6V30.4H38.4V14.4Z" fill="#EA4335"/>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
