'use client'

import { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import EssenceForm from "@/components/EssenceForm/EssenceForm";
import ScenarioGraphWrapper from "@/components/GraphEditor/GraphEditor";
import AdminUserRoleForm from "@/components/AdminUserRoleForm/AdminUserRoleForm";
import AdminUserDelete from "@/components/AdminDeleteUsers/AdminDeleteUsers";
import DocxList from "@/components/DocxList/DocxList";
import UploadDocx from "@/components/UploadDocx/UploadDocx";
import ViewDocx from "@/components/ViewDocx/ViewDocx";

export default function Home() {
	const [activeComponent, setActiveComponent] = useState('essence');

	const renderComponent = () => {
		switch (activeComponent) {
			case 'essence':
				return <EssenceForm />;
			case 'graph':
				return <ScenarioGraphWrapper />;
			case 'createUser':
				return (
					<>
						<AdminUserRoleForm />
					</>
				)
			case 'docx':
				return (
					<>
						<UploadDocx />
						<ViewDocx />
					</>
				)
			default:
				return null;
		}
	};

	return (
		<main style={{ position: 'relative' }}>
			<Sidebar setActiveComponent={setActiveComponent} />
			{renderComponent()}
		</main>
	);
}

